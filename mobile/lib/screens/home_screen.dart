import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/items/items_bloc.dart';
import '../blocs/items/items_event.dart';
import '../blocs/items/items_state.dart';
import '../models/item_model.dart';
import '../widgets/note_card_widget.dart';
import '../widgets/quick_create_sheet.dart';
import '../widgets/stats_dialog.dart';
import 'edit_item_screen.dart';

/// Etichette delle sezioni, condivise da drawer e barra superiore
/// così il filtro attivo ha sempre lo stesso nome ovunque compaia.
const Map<String, String> kFilterLabels = {
  'all': 'Tutti gli elementi',
  'notes': 'Note',
  'tasks': 'Task & Scadenze',
  'pinned': 'In evidenza',
  'archived': 'Archivio',
  'trash': 'Cestino',
};

const Map<String, IconData> kFilterIcons = {
  'all': Icons.layers_outlined,
  'notes': Icons.description_outlined,
  'tasks': Icons.check_box_outlined,
  'pinned': Icons.push_pin_outlined,
  'archived': Icons.archive_outlined,
  'trash': Icons.delete_outline,
};

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  bool _isSearching = false;
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'all'));
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  /// Attende la fine della digitazione prima di interrogare il database:
  /// senza attesa ogni singolo carattere farebbe ripartire la query.
  void _onSearchChanged(String query) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      final state = context.read<ItemsBloc>().state;
      if (state is ItemsLoadedState) {
        context.read<ItemsBloc>().add(LoadItemsEvent(
              filter: state.currentFilter,
              tag: state.selectedTag,
              search: query,
            ));
      }
    });
  }

  void _toggleSearch() {
    setState(() {
      if (_isSearching) {
        _searchDebounce?.cancel();
        _searchController.clear();
        final state = context.read<ItemsBloc>().state;
        if (state is ItemsLoadedState) {
          context.read<ItemsBloc>().add(
                LoadItemsEvent(filter: state.currentFilter, tag: state.selectedTag),
              );
        }
      }
      _isSearching = !_isSearching;
    });
  }

  void _selectFilter(String filter) {
    Navigator.pop(context);
    _searchDebounce?.cancel();
    _searchController.clear();
    if (_isSearching) setState(() => _isSearching = false);
    context.read<ItemsBloc>().add(LoadItemsEvent(filter: filter));
  }

  /// Sposta nel cestino lasciando una via d'uscita immediata.
  void _trashWithUndo(ItemModel item) {
    context.read<ItemsBloc>().add(DeleteItemEvent(item.id));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text('"${item.title.isEmpty ? 'Senza titolo' : item.title}" spostato nel cestino'),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 6),
          action: SnackBarAction(
            label: 'Annulla',
            onPressed: () => context.read<ItemsBloc>().add(RestoreItemEvent(item.id)),
          ),
        ),
      );
  }

  /// L'eliminazione definitiva è irreversibile: richiede una conferma esplicita.
  Future<void> _confirmPermanentDelete(ItemModel item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Eliminare definitivamente?'),
        content: Text(
          '"${item.title.isEmpty ? 'Senza titolo' : item.title}" verrà rimosso dal dispositivo. '
          'L\'operazione non può essere annullata.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Annulla'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Elimina per sempre'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      context.read<ItemsBloc>().add(DeleteItemEvent(item.id, permanent: true));
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(const SnackBar(
          content: Text('Elemento eliminato definitivamente'),
          behavior: SnackBarBehavior.floating,
        ));
    }
  }

  /// Attende il termine effettivo della sincronizzazione, altrimenti
  /// l'indicatore di aggiornamento sparirebbe prima che i dati arrivino.
  Future<void> _syncAndWait() async {
    final bloc = context.read<ItemsBloc>();
    bloc.add(SyncItemsEvent());
    await bloc.stream
        .firstWhere((s) => s is ItemsLoadedState && !s.isSyncing)
        .timeout(const Duration(seconds: 12), onTimeout: () => bloc.state);
  }

  Future<void> _manualSync() async {
    await _syncAndWait();
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(const SnackBar(
        content: Text('Sincronizzazione completata'),
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ));
  }

  void _openItem(ItemModel item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => EditItemScreen(
          item: item,
          onSave: (updated) => context.read<ItemsBloc>().add(UpdateItemEvent(updated)),
          onDelete: () => _trashWithUndo(item),
          onToggleTimer: () => context.read<ItemsBloc>().add(ToggleTimerEvent(item.id)),
        ),
      ),
    );
  }

  void _openQuickCreate() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (_) => QuickCreateSheet(
        onCreate: (newItem) => context.read<ItemsBloc>().add(AddItemEvent(newItem)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                textInputAction: TextInputAction.search,
                decoration: const InputDecoration(
                  hintText: 'Cerca per titolo, testo o tag...',
                  border: InputBorder.none,
                ),
                onChanged: _onSearchChanged,
              )
            : BlocBuilder<ItemsBloc, ItemsState>(
                builder: (context, state) {
                  final filter = state is ItemsLoadedState ? state.currentFilter : 'all';
                  final tag = state is ItemsLoadedState ? state.selectedTag : null;
                  return Row(
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
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('J.U.N.T.'),
                            // La sezione attiva resta sempre leggibile,
                            // senza dover riaprire il menu per ricordarla.
                            Text(
                              tag != null ? '#$tag' : (kFilterLabels[filter] ?? ''),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF78716C),
                                letterSpacing: 0.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),
        actions: [
          IconButton(
            tooltip: _isSearching ? 'Chiudi ricerca' : 'Cerca',
            icon: Icon(_isSearching ? Icons.close : Icons.search_rounded),
            onPressed: _toggleSearch,
          ),
          BlocBuilder<ItemsBloc, ItemsState>(
            builder: (context, state) {
              if (state is ItemsLoadedState) {
                return IconButton(
                  tooltip: 'Statistiche',
                  icon: const Icon(Icons.bar_chart_rounded),
                  onPressed: () => showDialog(
                    context: context,
                    builder: (_) => StatsDialog(state: state),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          BlocBuilder<ItemsBloc, ItemsState>(
            buildWhen: (a, b) => true,
            builder: (context, state) {
              final isSyncing = state is ItemsLoadedState && state.isSyncing;
              return IconButton(
                tooltip: isSyncing ? 'Sincronizzazione in corso' : 'Sincronizza ora',
                icon: isSyncing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFD97706)),
                      )
                    : const Icon(Icons.sync_rounded),
                onPressed: isSyncing ? null : _manualSync,
              );
            },
          ),
        ],
      ),
      drawer: BlocBuilder<ItemsBloc, ItemsState>(
        builder: (context, state) {
          final currentFilter = state is ItemsLoadedState ? state.currentFilter : 'all';
          return Drawer(
            child: SafeArea(
              bottom: false,
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
                        const Text('J.U.N.T.',
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF78350F))),
                        const Text('Just Unified Notes & Tasks',
                            style: TextStyle(fontSize: 12, color: Color(0xFF92400E))),
                      ],
                    ),
                  ),
                  ...kFilterLabels.entries.map((entry) {
                    final isSelected = currentFilter == entry.key;
                    return ListTile(
                      // La voce attiva è riconoscibile senza doverla ricordare.
                      selected: isSelected,
                      selectedColor: const Color(0xFF78350F),
                      selectedTileColor: const Color(0xFFFEF3C7),
                      leading: Icon(kFilterIcons[entry.key]),
                      title: Text(
                        entry.value,
                        style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
                      ),
                      onTap: () => _selectFilter(entry.key),
                    );
                  }),
                ],
              ),
            ),
          );
        },
      ),
      body: BlocConsumer<ItemsBloc, ItemsState>(
        listenWhen: (previous, current) => current is ItemsErrorState,
        listener: (context, state) {
          if (state is ItemsErrorState) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(SnackBar(
                content: Text('Operazione non riuscita: ${state.message}'),
                behavior: SnackBarBehavior.floating,
                backgroundColor: const Color(0xFFB91C1C),
              ));
          }
        },
        builder: (context, state) {
          if (state is ItemsLoadingState) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFD97706)));
          }

          if (state is ItemsErrorState) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off_rounded, size: 56, color: Colors.black26),
                    const SizedBox(height: 12),
                    const Text('Impossibile caricare i dati',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.black87)),
                    const SizedBox(height: 6),
                    Text(
                      state.message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 13, color: Colors.black54),
                    ),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: () => context.read<ItemsBloc>().add(const LoadItemsEvent(filter: 'all')),
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Riprova'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is ItemsLoadedState) {
            if (state.items.isEmpty) {
              return _EmptyState(
                state: state,
                onCreate: _openQuickCreate,
                onClearSearch: _isSearching ? _toggleSearch : null,
              );
            }

            final isTrashView = state.currentFilter == 'trash';
            final pinned = state.pinnedItems;
            final regular = state.regularItems;
            final showSections = pinned.isNotEmpty && !isTrashView && state.currentFilter != 'archived';

            // Intestazioni e schede in un unico elenco scorrevole.
            final entries = <Object>[
              if (showSections) ...[
                _SectionHeader('In evidenza', pinned.length, Icons.push_pin_rounded),
                ...pinned,
                _SectionHeader('Altre note & task', regular.length, Icons.layers_outlined),
                ...regular,
              ] else
                ...state.items,
            ];

            return RefreshIndicator(
              onRefresh: _syncAndWait,
              color: const Color(0xFFD97706),
              child: ListView.separated(
                // Lo spazio finale evita che l'ultima scheda finisca sotto il pulsante di creazione.
                padding: EdgeInsets.only(
                  left: 16,
                  right: 16,
                  top: 12,
                  bottom: 96 + MediaQuery.of(context).padding.bottom,
                ),
                itemCount: entries.length,
                separatorBuilder: (_, index) =>
                    SizedBox(height: entries[index] is _SectionHeader ? 4 : 12),
                itemBuilder: (context, index) {
                  final entry = entries[index];

                  if (entry is _SectionHeader) {
                    return Padding(
                      padding: EdgeInsets.only(top: index == 0 ? 0 : 18, bottom: 8, left: 4),
                      child: Row(
                        children: [
                          Icon(entry.icon, size: 14, color: const Color(0xFF92400E)),
                          const SizedBox(width: 6),
                          Text(
                            '${entry.label.toUpperCase()} (${entry.count})',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.1,
                              color: Color(0xFF92400E),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  final item = entry as ItemModel;
                  return NoteCardWidget(
                    // La chiave preserva lo stato del timer quando l'elenco si riordina.
                    key: ValueKey(item.id),
                    item: item,
                    isTrashView: isTrashView,
                    onTap: () => _openItem(item),
                    onToggleTimer: () => context.read<ItemsBloc>().add(ToggleTimerEvent(item.id)),
                    onToggleComplete: (completed) => context
                        .read<ItemsBloc>()
                        .add(UpdateItemEvent(item.copyWith(isCompleted: completed, updatedAt: DateTime.now()))),
                    onTogglePin: () => context
                        .read<ItemsBloc>()
                        .add(UpdateItemEvent(item.copyWith(isPinned: !item.isPinned, updatedAt: DateTime.now()))),
                    onTrash: () => isTrashView ? _confirmPermanentDelete(item) : _trashWithUndo(item),
                    onRestore: isTrashView
                        ? () {
                            context.read<ItemsBloc>().add(RestoreItemEvent(item.id));
                            ScaffoldMessenger.of(context)
                              ..hideCurrentSnackBar()
                              ..showSnackBar(const SnackBar(
                                content: Text('Elemento ripristinato'),
                                behavior: SnackBarBehavior.floating,
                              ));
                          }
                        : null,
                  );
                },
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFFDE68A),
        foregroundColor: const Color(0xFF78350F),
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onPressed: _openQuickCreate,
        icon: const Icon(Icons.add, size: 24),
        label: const Text('Nuova nota', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }
}

/// Intestazione di sezione all'interno dell'elenco.
class _SectionHeader {
  final String label;
  final int count;
  final IconData icon;
  const _SectionHeader(this.label, this.count, this.icon);
}

class _EmptyState extends StatelessWidget {
  final ItemsLoadedState state;
  final VoidCallback onCreate;
  final VoidCallback? onClearSearch;

  const _EmptyState({required this.state, required this.onCreate, this.onClearSearch});

  @override
  Widget build(BuildContext context) {
    final hasSearch = (state.searchQuery ?? '').trim().isNotEmpty;
    final filter = state.currentFilter;

    final String title;
    final String description;

    if (hasSearch) {
      title = 'Nessun risultato';
      description = 'Prova con parole diverse oppure azzera la ricerca.';
    } else if (filter == 'trash') {
      title = 'Cestino vuoto';
      description = 'Gli elementi eliminati restano qui prima della rimozione definitiva.';
    } else if (filter == 'archived') {
      title = 'Nessun elemento archiviato';
      description = 'Archivia una nota per metterla da parte senza eliminarla.';
    } else if (filter == 'tasks') {
      title = 'Nessun task attivo';
      description = 'Imposta una scadenza su una nota per trasformarla in task.';
    } else {
      title = 'Nessuna nota';
      description = 'Crea la tua prima nota per iniziare.';
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              hasSearch
                  ? Icons.search_off_rounded
                  : (kFilterIcons[filter] ?? Icons.note_alt_outlined),
              size: 60,
              color: Colors.black26,
            ),
            const SizedBox(height: 14),
            Text(title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
            const SizedBox(height: 6),
            Text(
              description,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Colors.black54, height: 1.4),
            ),
            const SizedBox(height: 18),
            if (hasSearch && onClearSearch != null)
              OutlinedButton.icon(
                onPressed: onClearSearch,
                icon: const Icon(Icons.close_rounded, size: 18),
                label: const Text('Azzera ricerca'),
              )
            else if (filter != 'trash' && filter != 'archived')
              FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFFDE68A),
                  foregroundColor: const Color(0xFF78350F),
                ),
                onPressed: onCreate,
                icon: const Icon(Icons.add_rounded, size: 20),
                label: const Text('Crea la prima nota'),
              ),
          ],
        ),
      ),
    );
  }
}
