import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../models/item_model.dart';
import '../theme/pastel_theme.dart';

class QuickCreateSheet extends StatefulWidget {
  final Function(ItemModel) onCreate;

  const QuickCreateSheet({super.key, required this.onCreate});

  @override
  State<QuickCreateSheet> createState() => _QuickCreateSheetState();
}

class _QuickCreateSheetState extends State<QuickCreateSheet> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _tagController = TextEditingController();

  String _selectedColor = '#FFFFFF';
  DateTime? _dueDate;
  final List<String> _tags = [];
  bool _isPinned = false;

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

  void _addTag() {
    final text = _tagController.text.trim().replaceAll('#', '');
    if (text.isNotEmpty && !_tags.contains(text)) {
      setState(() {
        _tags.add(text);
        _tagController.clear();
      });
    }
  }

  void _submit() {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.isEmpty && content.isEmpty) {
      Navigator.pop(context);
      return;
    }

    final newItem = ItemModel(
      id: const Uuid().v4(),
      title: title.isEmpty ? 'Senza titolo' : title,
      content: content,
      color: _selectedColor,
      isPinned: _isPinned,
      isArchived: false,
      isTrashed: false,
      dueDate: _dueDate,
      isCompleted: false,
      timeLogs: const [],
      tags: _tags,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      isSynced: false,
    );

    widget.onCreate(newItem);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: PastelColors.parseHex(_selectedColor),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: Title & Pin
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _titleController,
                  autofocus: true,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    hintText: 'Titolo',
                    border: InputBorder.none,
                    hintStyle: TextStyle(color: Colors.black38),
                  ),
                ),
              ),
              IconButton(
                icon: Icon(
                  _isPinned ? Icons.push_pin : Icons.push_pin_outlined,
                  color: _isPinned ? const Color(0xFFD97706) : Colors.black38,
                ),
                onPressed: () => setState(() => _isPinned = !_isPinned),
              ),
            ],
          ),

          // Content
          TextField(
            controller: _contentController,
            maxLines: 4,
            style: const TextStyle(fontSize: 14),
            decoration: const InputDecoration(
              hintText: 'Scrivi dettagli, idee o un nuovo task...',
              border: InputBorder.none,
              hintStyle: TextStyle(color: Colors.black38),
            ),
          ),

          // Tags list
          if (_tags.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Wrap(
                spacing: 6,
                children: _tags.map((t) => Chip(
                  label: Text('#$t', style: const TextStyle(fontSize: 11)),
                  onDeleted: () => setState(() => _tags.remove(t)),
                  backgroundColor: Colors.black.withValues(alpha: 0.05),
                  side: BorderSide.none,
                  padding: EdgeInsets.zero,
                )).toList(),
              ),
            ),

          // Tag Input Row
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _tagController,
                  style: const TextStyle(fontSize: 12),
                  decoration: const InputDecoration(
                    hintText: 'Aggiungi tag (es. #lavoro)...',
                    border: InputBorder.none,
                    hintStyle: TextStyle(color: Colors.black26),
                  ),
                  onSubmitted: (_) => _addTag(),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 20, color: Color(0xFFD97706)),
                onPressed: _addTag,
              ),
            ],
          ),

          // Color palette selector
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _pastelColors.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final hex = _pastelColors[index];
                final color = PastelColors.parseHex(hex);
                final isSelected = _selectedColor == hex;
                return GestureDetector(
                  onTap: () => setState(() => _selectedColor = hex),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? const Color(0xFF0F172A) : Colors.black12,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          // Bottom Action Bar: Due Date, Tag input, Save button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  // Due Date Picker
                  IconButton(
                    icon: Icon(
                      _dueDate != null ? Icons.event_available : Icons.event_outlined,
                      color: _dueDate != null ? const Color(0xFF0284C7) : Colors.black54,
                    ),
                    onPressed: () async {
                      final pickedDate = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime.now().subtract(const Duration(days: 365)),
                        lastDate: DateTime.now().add(const Duration(days: 3650)),
                      );
                      if (pickedDate != null) {
                        if (!context.mounted) return;
                        final pickedTime = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.now(),
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
              ElevatedButton.icon(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFDE68A),
                  foregroundColor: const Color(0xFF78350F),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Crea', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
