import 'package:equatable/equatable.dart';
import '../../models/item_model.dart';

abstract class ItemsState extends Equatable {
  const ItemsState();

  @override
  List<Object?> get props => [];
}

class ItemsLoadingState extends ItemsState {}

class ItemsLoadedState extends ItemsState {
  final List<ItemModel> items;
  final String currentFilter;
  final String? selectedTag;
  final String? searchQuery;
  final bool isSyncing;

  const ItemsLoadedState({
    required this.items,
    this.currentFilter = 'all',
    this.selectedTag,
    this.searchQuery,
    this.isSyncing = false,
  });

  List<ItemModel> get pinnedItems => items.where((i) => i.isPinned).toList();
  List<ItemModel> get regularItems => items.where((i) => !i.isPinned).toList();
  List<ItemModel> get activeTimerItems => items.where((i) => i.isTimerRunning).toList();

  int get notesCount => items.where((i) => !i.isTask && !i.isArchived && !i.isTrashed).length;
  int get tasksCount => items.where((i) => i.isTask && !i.isArchived && !i.isTrashed).length;
  int get completedTasksCount => items.where((i) => i.isTask && i.isCompleted).length;

  int get totalTrackedSeconds => items.fold(0, (sum, i) => sum + i.totalDurationSeconds);

  List<String> get allTags {
    final set = <String>{};
    for (final item in items) {
      set.addAll(item.tags);
    }
    return set.toList();
  }

  ItemsLoadedState copyWith({
    List<ItemModel>? items,
    String? currentFilter,
    String? selectedTag,
    String? searchQuery,
    bool? isSyncing,
  }) {
    return ItemsLoadedState(
      items: items ?? this.items,
      currentFilter: currentFilter ?? this.currentFilter,
      selectedTag: selectedTag ?? this.selectedTag,
      searchQuery: searchQuery ?? this.searchQuery,
      isSyncing: isSyncing ?? this.isSyncing,
    );
  }

  @override
  List<Object?> get props => [items, currentFilter, selectedTag, searchQuery, isSyncing];
}

class ItemsErrorState extends ItemsState {
  final String message;
  const ItemsErrorState(this.message);

  @override
  List<Object?> get props => [message];
}
