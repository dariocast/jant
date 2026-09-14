import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/item_model.dart';
import '../theme/pastel_theme.dart';

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

  late String _color;
  late bool _isPinned;
  late bool _isArchived;
  late bool _isCompleted;
  DateTime? _dueDate;
  late List<String> _tags;

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
  }

  void _save() {
    final updated = widget.item.copyWith(
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
    widget.onSave(updated);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = PastelColors.parseHex(_color);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: _save,
        ),
        actions: [
          // Pin toggle
          IconButton(
            icon: Icon(
              _isPinned ? Icons.push_pin : Icons.push_pin_outlined,
              color: _isPinned ? const Color(0xFFD97706) : Colors.black54,
            ),
            onPressed: () => setState(() => _isPinned = !_isPinned),
          ),
          // Archive toggle
          IconButton(
            icon: Icon(
              _isArchived ? Icons.archive : Icons.archive_outlined,
              color: _isArchived ? const Color(0xFF0284C7) : Colors.black54,
            ),
            onPressed: () => setState(() => _isArchived = !_isArchived),
          ),
          // Delete
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, color: Colors.black54),
            onPressed: () {
              widget.onDelete();
              Navigator.pop(context);
            },
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
                  // Task Checkbox if task
                  if (_dueDate != null) ...[
                    Row(
                      children: [
                        Checkbox(
                          value: _isCompleted,
                          onChanged: (val) => setState(() => _isCompleted = val ?? false),
                          activeColor: const Color(0xFF10B981),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        Text(
                          _isCompleted ? 'Completato' : 'In sospeso',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _isCompleted ? const Color(0xFF10B981) : Colors.black54,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                  ],

                  // Title
                  TextField(
                    controller: _titleController,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.5),
                    decoration: const InputDecoration(
                      hintText: 'Titolo',
                      border: InputBorder.none,
                      hintStyle: TextStyle(color: Colors.black26),
                    ),
                  ),

                  // Content
                  TextField(
                    controller: _contentController,
                    maxLines: null,
                    style: const TextStyle(fontSize: 15, height: 1.5),
                    decoration: const InputDecoration(
                      hintText: 'Scrivi dettagli, note o checklist...',
                      border: InputBorder.none,
                      hintStyle: TextStyle(color: Colors.black26),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Tags
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      ..._tags.map((t) => Chip(
                        label: Text('#$t', style: const TextStyle(fontSize: 11)),
                        onDeleted: () => setState(() => _tags.remove(t)),
                        backgroundColor: Colors.black.withValues(alpha: 0.05),
                        side: BorderSide.none,
                      )),
                    ],
                  ),
                ],
              ),
            ),

            // Bottom toolbar: Due date, tags, colors, timer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.7),
                border: Border(top: BorderSide(color: Colors.black.withValues(alpha: 0.06))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Due Date picker
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          _dueDate != null ? Icons.event_available : Icons.event_outlined,
                          color: _dueDate != null ? const Color(0xFF0284C7) : Colors.black54,
                        ),
                        onPressed: () async {
                          final pickedDate = await showDatePicker(
                            context: context,
                            initialDate: _dueDate ?? DateTime.now(),
                            firstDate: DateTime.now().subtract(const Duration(days: 365)),
                            lastDate: DateTime.now().add(const Duration(days: 3650)),
                          );
                          if (pickedDate != null) {
                            if (!context.mounted) return;
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
                        },
                      ),
                      if (_dueDate != null)
                        Text(
                          DateFormat('d MMM, HH:mm').format(_dueDate!),
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0284C7)),
                        ),
                    ],
                  ),

                  // Color Picker Horizontal List
                  SizedBox(
                    height: 28,
                    width: 140,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _pastelColors.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 6),
                      itemBuilder: (context, index) {
                        final hex = _pastelColors[index];
                        final c = PastelColors.parseHex(hex);
                        final isSel = _color == hex;
                        return GestureDetector(
                          onTap: () => setState(() => _color = hex),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: c,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSel ? const Color(0xFF0F172A) : Colors.black12,
                                width: isSel ? 2 : 1,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Done / Save
                  IconButton(
                    icon: const Icon(Icons.check_circle_rounded, color: Color(0xFFD97706), size: 28),
                    onPressed: _save,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
