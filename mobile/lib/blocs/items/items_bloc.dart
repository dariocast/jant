import 'package:flutter_bloc/flutter_bloc.dart';
import 'items_event.dart';
import 'items_state.dart';
import '../../services/database_helper.dart';
import '../../services/sync_manager.dart';
import '../../models/item_model.dart';

class ItemsBloc extends Bloc<ItemsEvent, ItemsState> {
  final DatabaseHelper dbHelper;
  final SyncManager syncManager;

  ItemsBloc({
    DatabaseHelper? dbHelper,
    SyncManager? syncManager,
  })  : dbHelper = dbHelper ?? DatabaseHelper.instance,
        syncManager = syncManager ?? SyncManager(),
        super(ItemsLoadingState()) {
    on<LoadItemsEvent>(_onLoadItems);
    on<AddItemEvent>(_onAddItem);
    on<UpdateItemEvent>(_onUpdateItem);
    on<DeleteItemEvent>(_onDeleteItem);
    on<RestoreItemEvent>(_onRestoreItem);
    on<ToggleTimerEvent>(_onToggleTimer);
    on<SyncItemsEvent>(_onSyncItems);
  }

  Future<void> _onLoadItems(LoadItemsEvent event, Emitter<ItemsState> emit) async {
    try {
      final items = await dbHelper.getItems(
        filter: event.filter,
        tag: event.tag,
        search: event.search,
      );
      emit(ItemsLoadedState(
        items: items,
        currentFilter: event.filter,
        selectedTag: event.tag,
        searchQuery: event.search,
      ));
    } catch (e) {
      emit(ItemsErrorState(e.toString()));
    }
  }

  Future<void> _onAddItem(AddItemEvent event, Emitter<ItemsState> emit) async {
    try {
      await dbHelper.insertOrUpdate(event.item);
      if (state is ItemsLoadedState) {
        final current = state as ItemsLoadedState;
        add(LoadItemsEvent(
          filter: current.currentFilter,
          tag: current.selectedTag,
          search: current.searchQuery,
        ));
      }
      // Trigger background sync
      syncManager.sync().catchError((_) {});
    } catch (e) {
      emit(ItemsErrorState(e.toString()));
    }
  }

  Future<void> _onUpdateItem(UpdateItemEvent event, Emitter<ItemsState> emit) async {
    try {
      await dbHelper.insertOrUpdate(event.item);
      if (state is ItemsLoadedState) {
        final current = state as ItemsLoadedState;
        add(LoadItemsEvent(
          filter: current.currentFilter,
          tag: current.selectedTag,
          search: current.searchQuery,
        ));
      }
      syncManager.sync().catchError((_) {});
    } catch (e) {
      emit(ItemsErrorState(e.toString()));
    }
  }

  Future<void> _onDeleteItem(DeleteItemEvent event, Emitter<ItemsState> emit) async {
    try {
      if (event.permanent) {
        await dbHelper.deleteItemPermanently(event.id);
      } else {
        final item = await dbHelper.getItemById(event.id);
        if (item != null) {
          await dbHelper.insertOrUpdate(item.copyWith(isTrashed: true, isSynced: false));
        }
      }

      if (state is ItemsLoadedState) {
        final current = state as ItemsLoadedState;
        add(LoadItemsEvent(
          filter: current.currentFilter,
          tag: current.selectedTag,
          search: current.searchQuery,
        ));
      }
      syncManager.sync().catchError((_) {});
    } catch (e) {
      emit(ItemsErrorState(e.toString()));
    }
  }

  Future<void> _onRestoreItem(RestoreItemEvent event, Emitter<ItemsState> emit) async {
    try {
      final item = await dbHelper.getItemById(event.id);
      if (item != null) {
        await dbHelper.insertOrUpdate(
          item.copyWith(isTrashed: false, updatedAt: DateTime.now(), isSynced: false),
        );
      }
      _reloadCurrentView();
      syncManager.sync().catchError((_) {});
    } catch (e) {
      emit(ItemsErrorState(e.toString()));
    }
  }

  /// Ricarica l'elenco mantenendo filtro, tag e ricerca correnti.
  void _reloadCurrentView() {
    final current = state;
    if (current is ItemsLoadedState) {
      add(LoadItemsEvent(
        filter: current.currentFilter,
        tag: current.selectedTag,
        search: current.searchQuery,
      ));
    }
  }

  Future<void> _onToggleTimer(ToggleTimerEvent event, Emitter<ItemsState> emit) async {
    try {
      final item = await dbHelper.getItemById(event.id);
      if (item != null) {
        List<TimeLog> logs = List.from(item.timeLogs);
        final activeIndex = logs.indexWhere((l) => l.end == null);

        if (activeIndex >= 0) {
          logs[activeIndex] = TimeLog(
            start: logs[activeIndex].start,
            end: DateTime.now().toIso8601String(),
          );
        } else {
          logs.add(TimeLog(
            start: DateTime.now().toIso8601String(),
            end: null,
          ));
        }

        final updated = item.copyWith(
          timeLogs: logs,
          updatedAt: DateTime.now(),
          isSynced: false,
        );

        await dbHelper.insertOrUpdate(updated);

        if (state is ItemsLoadedState) {
          final current = state as ItemsLoadedState;
          add(LoadItemsEvent(
            filter: current.currentFilter,
            tag: current.selectedTag,
            search: current.searchQuery,
          ));
        }
        syncManager.sync().catchError((_) {});
      }
    } catch (e) {
      emit(ItemsErrorState(e.toString()));
    }
  }

  Future<void> _onSyncItems(SyncItemsEvent event, Emitter<ItemsState> emit) async {
    if (state is ItemsLoadedState) {
      emit((state as ItemsLoadedState).copyWith(isSyncing: true));
    }
    try {
      await syncManager.sync();
      if (state is ItemsLoadedState) {
        final current = state as ItemsLoadedState;
        final items = await dbHelper.getItems(
          filter: current.currentFilter,
          tag: current.selectedTag,
          search: current.searchQuery,
        );
        emit(current.copyWith(items: items, isSyncing: false));
      }
    } catch (_) {
      if (state is ItemsLoadedState) {
        emit((state as ItemsLoadedState).copyWith(isSyncing: false));
      }
    }
  }
}
