import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/items/items_bloc.dart';
import '../blocs/items/items_event.dart';
import '../blocs/items/items_state.dart';
import '../widgets/note_card_widget.dart';
import '../widgets/quick_create_sheet.dart';
import '../widgets/stats_dialog.dart';
import 'edit_item_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'all'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Cerca per titolo, testo o tag...',
                  border: InputBorder.none,
                ),
                onChanged: (query) {
                  final state = context.read<ItemsBloc>().state;
                  if (state is ItemsLoadedState) {
                    context.read<ItemsBloc>().add(LoadItemsEvent(
                      filter: state.currentFilter,
                      tag: state.selectedTag,
                      search: query,
                    ));
                  }
                },
              )
            : Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.asset(
                      'assets/images/logo-light.png',
                      width: 32,
                      height: 32,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text('J.U.N.T.'),
                ],
              ),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search_rounded),
            onPressed: () {
              setState(() {
                if (_isSearching) {
                  _searchController.clear();
                  final state = context.read<ItemsBloc>().state;
                  if (state is ItemsLoadedState) {
                    context.read<ItemsBloc>().add(LoadItemsEvent(filter: state.currentFilter, tag: state.selectedTag));
                  }
                }
                _isSearching = !_isSearching;
              });
            },
          ),
          BlocBuilder<ItemsBloc, ItemsState>(
            builder: (context, state) {
              if (state is ItemsLoadedState) {
                return IconButton(
                  icon: const Icon(Icons.bar_chart_rounded),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => StatsDialog(state: state),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          IconButton(
            icon: const Icon(Icons.sync_rounded),
            onPressed: () {
              context.read<ItemsBloc>().add(SyncItemsEvent());
            },
          ),
        ],
      ),
      drawer: BlocBuilder<ItemsBloc, ItemsState>(
        builder: (context, state) {
          if (state is! ItemsLoadedState) return const Drawer();
          return Drawer(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                DrawerHeader(
                  decoration: const BoxDecoration(color: Color(0xFFFEF3C7)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.asset(
                          'assets/images/logo-light.png',
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text('J.U.N.T.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF78350F))),
                      const Text('Just Unified Notes & Tasks', style: TextStyle(fontSize: 12, color: Color(0xFF92400E))),
                    ],
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.layers_outlined),
                  title: const Text('Tutti gli elementi'),
                  onTap: () {
                    Navigator.pop(context);
                    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'all'));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.description_outlined),
                  title: const Text('Note'),
                  onTap: () {
                    Navigator.pop(context);
                    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'notes'));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.check_box_outlined),
                  title: const Text('Task & Scadenze'),
                  onTap: () {
                    Navigator.pop(context);
                    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'tasks'));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.push_pin_outlined),
                  title: const Text('In Evidenza'),
                  onTap: () {
                    Navigator.pop(context);
                    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'pinned'));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.archive_outlined),
                  title: const Text('Archivio'),
                  onTap: () {
                    Navigator.pop(context);
                    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'archived'));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.delete_outline),
                  title: const Text('Cestino'),
                  onTap: () {
                    Navigator.pop(context);
                    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'trash'));
                  },
                ),
              ],
            ),
          );
        },
      ),
      body: BlocBuilder<ItemsBloc, ItemsState>(
        builder: (context, state) {
          if (state is ItemsLoadingState) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFD97706)));
          }

          if (state is ItemsErrorState) {
            return Center(child: Text('Errore: ${state.message}'));
          }

          if (state is ItemsLoadedState) {
            if (state.items.isEmpty) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      state.currentFilter == 'tasks' ? Icons.check_circle_outline : Icons.note_alt_outlined,
                      size: 64,
                      color: Colors.black26,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      state.currentFilter == 'trash'
                          ? 'Cestino vuoto'
                          : (state.currentFilter == 'tasks' ? 'Nessun task attivo' : 'Nessuna nota trovata'),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black54),
                    ),
                    const SizedBox(height: 4),
                    const Text('Tocca il pulsante + per crearne una', style: TextStyle(fontSize: 13, color: Colors.black38)),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                context.read<ItemsBloc>().add(SyncItemsEvent());
              },
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                itemCount: state.items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = state.items[index];
                  return NoteCardWidget(
                    item: item,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => EditItemScreen(
                            item: item,
                            onSave: (updated) {
                              context.read<ItemsBloc>().add(UpdateItemEvent(updated));
                            },
                            onDelete: () {
                              context.read<ItemsBloc>().add(DeleteItemEvent(item.id));
                            },
                            onToggleTimer: () {
                              context.read<ItemsBloc>().add(ToggleTimerEvent(item.id));
                            },
                          ),
                        ),
                      );
                    },
                    onToggleTimer: () {
                      context.read<ItemsBloc>().add(ToggleTimerEvent(item.id));
                    },
                    onToggleComplete: (completed) {
                      context.read<ItemsBloc>().add(UpdateItemEvent(item.copyWith(isCompleted: completed)));
                    },
                    onTogglePin: () {
                      context.read<ItemsBloc>().add(UpdateItemEvent(item.copyWith(isPinned: !item.isPinned)));
                    },
                    onTrash: () {
                      context.read<ItemsBloc>().add(DeleteItemEvent(item.id));
                    },
                  );
                },
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFFDE68A),
        foregroundColor: const Color(0xFF78350F),
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => QuickCreateSheet(
              onCreate: (newItem) {
                context.read<ItemsBloc>().add(AddItemEvent(newItem));
              },
            ),
          );
        },
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }
}
