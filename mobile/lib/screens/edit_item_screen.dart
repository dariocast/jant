import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:intl/intl.dart';
import '../models/item_model.dart';
import '../theme/pastel_theme.dart';
import '../widgets/markdown_toolbar.dart';

class EditItemScreen extends StatefulWidget {
  final ItemModel item;
  final Function(ItemModel) onSave;
  final VoidCallback onDelete;
  final VoidCallback onToggleTimer;

  const EditItemScreen({
    super.key,
    required this.item,
    required this.onSave,
    required this.onDelete,
    required this.onToggleTimer,
  });

  @override
  State<EditItemScreen> createState() => _EditItemScreenState();
}

class _EditItemScreenState extends State<EditItemScreen> {
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  final _tagController = TextEditingController();
  bool _isPreviewMode = false;
  bool _isSaved = false;

  late String _color;
  late bool _isPinned;
  late bool _isArchived;
  late bool _isCompleted;
  DateTime? _dueDate;
  late List<String> _tags;

  Timer? _ticker;
  late int _duration;
  late bool _isTimerRunning;

  final List<String> _pastelColors = [
    '#FFFFFF',
    '#FEF3C7',
    '#DCFCE7',
    '#E0F2FE',
    '#F3E8FF',
    '#FFE4E6',
    '#FFEDD5',
    '#CCFBF1',
  ];

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.item.title);
    _contentController = TextEditingController(text: widget.item.content);
    _color = widget.item.color;
    _isPinned = widget.item.isPinned;
    _isArchived = widget.item.isArchived;
    _isCompleted = widget.item.isCompleted;
    _dueDate = widget.item.dueDate;
    _tags = List.from(widget.item.tags);
    _duration = widget.item.totalDurationSeconds;
    _isTimerRunning = widget.item.isTimerRunning;
    if (_isTimerRunning) _startTicking();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _titleController.dispose();
    _contentController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  void _startTicking() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _duration++);
    });
  }

  String _formatTime(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  ItemModel _buildUpdated() => widget.item.copyWith(
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        color: _color,
        isPinned: _isPinned,
        isArchived: _isArchived,
        isCompleted: _isCompleted,
        dueDate: _dueDate,
        tags: _tags,
        updatedAt: DateTime.now(),
        isSynced: false,
      );

  void _save() {
    if (_isSaved) return;
    _isSaved = true;
    widget.onSave(_buildUpdated());
    Navigator.pop(context);
  }

  void _addTag() {
    final text = _tagController.text.trim().replaceAll('#', '');
    if (text.isNotEmpty && !_tags.contains(text)) {
      setState(() {
        _tags.add(text);
        _tagController.clear();
      });
    }
  }

  void _insertMarkdown(String prefix, String suffix, String placeholder) {
    insertMarkdownInto(_contentController, prefix, suffix, placeholder);
    if (_isPreviewMode) setState(() => _isPreviewMode = false);
  }

  Future<void> _pickDueDate() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 3650)),
    );
    if (pickedDate == null || !mounted) return;

    final pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_dueDate ?? DateTime.now()),
    );
    if (pickedTime != null && mounted) {
      setState(() {
        _dueDate = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );
      });
    }
  }

  Future<void> _confirmDelete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Spostare nel cestino?'),
        content: const Text('Potrai ripristinare l\'elemento dalla sezione Cestino.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Annulla'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Sposta nel cestino'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      _isSaved = true; // evita che l'uscita risalvi l'elemento appena cestinato
      widget.onDelete();
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = PastelColors.parseHex(_color);

    // Anche uscendo con il gesto di sistema le modifiche vengono salvate:
    // nessuna via d'uscita deve far perdere ciò che si è scritto.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _save();
      },
      child: Scaffold(
        backgroundColor: bgColor,
        appBar: AppBar(
          backgroundColor: bgColor,
          leading: IconButton(
            tooltip: 'Salva e torna indietro',
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: _save,
          ),
          actions: [
            IconButton(
              tooltip: _isPreviewMode ? 'Modifica testo' : 'Anteprima Markdown',
              icon: Icon(
                _isPreviewMode ? Icons.edit_note_rounded : Icons.visibility_outlined,
                color: _isPreviewMode ? const Color(0xFFD97706) : Colors.black54,
              ),
              onPressed: () => setState(() => _isPreviewMode = !_isPreviewMode),
            ),
            IconButton(
              tooltip: _isPinned ? 'Rimuovi dall\'evidenza' : 'Metti in evidenza',
              icon: Icon(
                _isPinned ? Icons.push_pin : Icons.push_pin_outlined,
                color: _isPinned ? const Color(0xFFD97706) : Colors.black54,
              ),
              onPressed: () => setState(() => _isPinned = !_isPinned),
            ),
            IconButton(
              tooltip: _isArchived ? 'Estrai da archivio' : 'Archivia',
              icon: Icon(
                _isArchived ? Icons.archive : Icons.archive_outlined,
                color: _isArchived ? const Color(0xFF0284C7) : Colors.black54,
              ),
              onPressed: () => setState(() => _isArchived = !_isArchived),
            ),
            IconButton(
              tooltip: 'Sposta nel cestino',
              icon: const Icon(Icons.delete_outline_rounded, color: Colors.black54),
              onPressed: _confirmDelete,
            ),
          ],
        ),
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  children: [
                    // Stato del task
                    if (_dueDate != null) ...[
                      InkWell(
                        onTap: () => setState(() => _isCompleted = !_isCompleted),
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Checkbox(
                                value: _isCompleted,
                                onChanged: (val) => setState(() => _isCompleted = val ?? false),
                                activeColor: const Color(0xFF059669),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              Text(
                                _isCompleted ? 'Completato' : 'In sospeso',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: _isCompleted ? const Color(0xFF047857) : Colors.black54,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],

                    // Titolo
                    TextField(
                      controller: _titleController,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.5),
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        hintText: 'Titolo',
                        border: InputBorder.none,
                        hintStyle: TextStyle(color: Colors.black38),
                      ),
                    ),

                    const Divider(height: 16, thickness: 0.5, color: Colors.black12),

                    // Barra di formattazione Markdown (solo in modifica)
                    if (!_isPreviewMode) ...[
                      MarkdownToolbar(onInsert: _insertMarkdown),
                      const SizedBox(height: 6),
                    ],

                    // Contenuto: modifica o anteprima
                    if (_isPreviewMode)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: MarkdownBody(
                          data: _contentController.text.trim().isNotEmpty
                              ? _contentController.text
                              : '*Nessun contenuto. Tocca l\'icona modifica per scrivere.*',
                          selectable: true,
                          styleSheet: MarkdownStyleSheet.fromTheme(Theme.of(context)).copyWith(
                            p: const TextStyle(fontSize: 15, height: 1.5, color: Color(0xFF1E293B)),
                            h1: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            h2: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            h3: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            blockquoteDecoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.04),
                              borderRadius: BorderRadius.circular(4),
                              border: const Border(left: BorderSide(color: Color(0xFFD97706), width: 3)),
                            ),
                            code: TextStyle(
                              backgroundColor: Colors.black.withValues(alpha: 0.06),
                              fontFamily: 'monospace',
                              fontSize: 13,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                        ),
                      )
                    else
                      TextField(
                        controller: _contentController,
                        maxLines: null,
                        style: const TextStyle(fontSize: 15, height: 1.5),
                        textCapitalization: TextCapitalization.sentences,
                        decoration: const InputDecoration(
                          hintText: 'Scrivi dettagli, note o checklist (supporta Markdown)...',
                          border: InputBorder.none,
                          hintStyle: TextStyle(color: Colors.black38),
                        ),
                      ),
                    const SizedBox(height: 16),

                    // Tag, con campo di inserimento come sul web
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        ..._tags.map((t) => Chip(
                              label: Text('#$t', style: const TextStyle(fontSize: 12)),
                              onDeleted: () => setState(() => _tags.remove(t)),
                              deleteButtonTooltipMessage: 'Rimuovi tag $t',
                              backgroundColor: Colors.black.withValues(alpha: 0.05),
                              side: BorderSide.none,
                            )),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _tagController,
                            style: const TextStyle(fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: 'Aggiungi tag (es. lavoro)...',
                              border: InputBorder.none,
                              hintStyle: TextStyle(color: Colors.black38),
                            ),
                            onSubmitted: (_) => _addTag(),
                          ),
                        ),
                        IconButton(
                          tooltip: 'Aggiungi tag',
                          icon: const Icon(Icons.add_circle_outline, size: 22, color: Color(0xFFB45309)),
                          onPressed: _addTag,
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    // Tracciamento del tempo, disponibile anche qui e non solo sulla scheda
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.04),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.timer_outlined, size: 18, color: Color(0xFF57534E)),
                              const SizedBox(width: 8),
                              Text(
                                _formatTime(_duration),
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF1C1917),
                                ),
                              ),
                            ],
                          ),
                          FilledButton.icon(
                            style: FilledButton.styleFrom(
                              backgroundColor:
                                  _isTimerRunning ? const Color(0xFFDC2626) : const Color(0xFFFDE68A),
                              foregroundColor:
                                  _isTimerRunning ? Colors.white : const Color(0xFF78350F),
                            ),
                            onPressed: () {
                              widget.onToggleTimer();
                              setState(() {
                                _isTimerRunning = !_isTimerRunning;
                                if (_isTimerRunning) {
                                  _startTicking();
                                } else {
                                  _ticker?.cancel();
                                }
                              });
                            },
                            icon: Icon(
                              _isTimerRunning ? Icons.stop_rounded : Icons.play_arrow_rounded,
                              size: 18,
                            ),
                            label: Text(_isTimerRunning ? 'Ferma timer' : 'Avvia timer'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Barra inferiore: scadenza, colori, salvataggio
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.7),
                  border: Border(top: BorderSide(color: Colors.black.withValues(alpha: 0.06))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            tooltip: _dueDate != null ? 'Modifica scadenza' : 'Imposta scadenza',
                            icon: Icon(
                              _dueDate != null ? Icons.event_available : Icons.event_outlined,
                              color: _dueDate != null ? const Color(0xFF0369A1) : Colors.black54,
                            ),
                            onPressed: _pickDueDate,
                          ),
                          if (_dueDate != null)
                            Flexible(
                              child: InkWell(
                                onTap: _pickDueDate,
                                child: Text(
                                  DateFormat('d MMM, HH:mm').format(_dueDate!),
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0369A1)),
                                ),
                              ),
                            ),
                          if (_dueDate != null)
                            IconButton(
                              tooltip: 'Rimuovi scadenza (torna a nota)',
                              icon: const Icon(Icons.close_rounded, size: 18, color: Colors.black45),
                              onPressed: () => setState(() => _dueDate = null),
                            ),
                        ],
                      ),
                    ),

                    // Selettore colore
                    SizedBox(
                      height: 40,
                      width: 132,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _pastelColors.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 6),
                        itemBuilder: (context, index) {
                          final hex = _pastelColors[index];
                          final c = PastelColors.parseHex(hex);
                          final isSel = _color == hex;
                          return Semantics(
                            button: true,
                            selected: isSel,
                            label: 'Colore ${index + 1}',
                            child: InkWell(
                              onTap: () => setState(() => _color = hex),
                              customBorder: const CircleBorder(),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    color: c,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: isSel ? const Color(0xFF0F172A) : Colors.black26,
                                      width: isSel ? 2 : 1,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    IconButton(
                      tooltip: 'Salva e chiudi',
                      icon: const Icon(Icons.check_circle_rounded, color: Color(0xFFB45309), size: 30),
                      onPressed: _save,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
