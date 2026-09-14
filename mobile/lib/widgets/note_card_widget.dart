import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:intl/intl.dart';
import '../models/item_model.dart';
import '../theme/pastel_theme.dart';

class NoteCardWidget extends StatefulWidget {
  final ItemModel item;
  final VoidCallback onTap;
  final VoidCallback onToggleTimer;
  final ValueChanged<bool> onToggleComplete;
  final VoidCallback onTogglePin;
  final VoidCallback onTrash;
  final VoidCallback? onRestore;
  final bool isTrashView;

  const NoteCardWidget({
    super.key,
    required this.item,
    required this.onTap,
    required this.onToggleTimer,
    required this.onToggleComplete,
    required this.onTogglePin,
    required this.onTrash,
    this.onRestore,
    this.isTrashView = false,
  });

  @override
  State<NoteCardWidget> createState() => _NoteCardWidgetState();
}

class _NoteCardWidgetState extends State<NoteCardWidget> {
  Timer? _timer;
  late int _duration;

  @override
  void initState() {
    super.initState();
    _duration = widget.item.totalDurationSeconds;
    if (widget.item.isTimerRunning) {
      _startTicking();
    }
  }

  @override
  void didUpdateWidget(covariant NoteCardWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    _duration = widget.item.totalDurationSeconds;
    if (widget.item.isTimerRunning && !oldWidget.item.isTimerRunning) {
      _startTicking();
    } else if (!widget.item.isTimerRunning && oldWidget.item.isTimerRunning) {
      _timer?.cancel();
    }
  }

  void _startTicking() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          _duration++;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTime(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    if (h > 0) {
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final cardColor = PastelColors.parseHex(item.color);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(20),
        splashColor: Colors.black.withValues(alpha: 0.05),
        child: Container(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: item.isPinned ? const Color(0xFFFDE68A) : Colors.black.withValues(alpha: 0.06),
            width: item.isPinned ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Task checkbox / Due Date badge & Pin
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (item.isTask)
                  Row(
                    children: [
                      _TapIcon(
                        icon: item.isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                        color: item.isCompleted ? const Color(0xFF10B981) : Colors.black54,
                        tooltip: item.isCompleted ? 'Segna come non completato' : 'Segna come completato',
                        onTap: widget.isTrashView ? null : () => widget.onToggleComplete(!item.isCompleted),
                      ),
                      if (item.dueDate != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                          ),
                          child: Text(
                            DateFormat('d MMM, HH:mm').format(item.dueDate!),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: item.isCompleted ? Colors.black54 : const Color(0xFF075985),
                              decoration: item.isCompleted ? TextDecoration.lineThrough : null,
                            ),
                          ),
                        ),
                      ],
                    ],
                  )
                else
                  const SizedBox.shrink(),
                _TapIcon(
                  icon: item.isPinned ? Icons.push_pin : Icons.push_pin_outlined,
                  color: item.isPinned ? const Color(0xFFD97706) : Colors.black45,
                  tooltip: item.isPinned ? 'Rimuovi dall\'evidenza' : 'Metti in evidenza',
                  onTap: widget.isTrashView ? null : widget.onTogglePin,
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Title
            if (item.title.isNotEmpty)
              Text(
                item.title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.3,
                  color: item.isCompleted ? Colors.black38 : const Color(0xFF0F172A),
                  decoration: item.isCompleted ? TextDecoration.lineThrough : null,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

            // Content
            if (item.content.isNotEmpty) ...[
              const SizedBox(height: 4),
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 180),
                child: Wrap(
                  children: [
                    MarkdownBody(
                            data: item.content,
                      selectable: false,
                      shrinkWrap: true,
                      styleSheet: MarkdownStyleSheet(
                        p: TextStyle(
                          fontSize: 13,
                          height: 1.4,
                          color: item.isCompleted ? Colors.black54 : const Color(0xFF334155),
                          decoration: item.isCompleted ? TextDecoration.lineThrough : null,
                        ),
                        h1: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        h2: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        h3: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        code: const TextStyle(
                            fontSize: 11, fontFamily: 'monospace', backgroundColor: Color(0x10000000)),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Tags
            if (item.tags.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: item.tags.map((tag) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '#$tag',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                    ),
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: 10),
            // Bottom bar: Play/Stop Timer button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Semantics(
                  button: true,
                  label: item.isTimerRunning ? 'Ferma il timer' : 'Avvia il timer',
                  child: InkWell(
                    onTap: widget.isTrashView ? null : widget.onToggleTimer,
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: item.isTimerRunning
                            ? const Color(0xFFDC2626)
                            : (_duration > 0 ? const Color(0xFFFEF3C7) : Colors.white.withValues(alpha: 0.9)),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: item.isTimerRunning
                              ? Colors.transparent
                              : (_duration > 0 ? const Color(0xFFFDE68A) : Colors.black.withValues(alpha: 0.08)),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            item.isTimerRunning ? Icons.stop_rounded : Icons.play_arrow_rounded,
                            size: 16,
                            color: item.isTimerRunning ? Colors.white : const Color(0xFF78350F),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            _formatTime(_duration),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                              color: item.isTimerRunning ? Colors.white : const Color(0xFF78350F),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    if (widget.isTrashView && widget.onRestore != null)
                      _TapIcon(
                        icon: Icons.restore_rounded,
                        color: const Color(0xFF047857),
                        tooltip: 'Ripristina dal cestino',
                        onTap: widget.onRestore,
                      ),
                    _TapIcon(
                      icon: widget.isTrashView
                          ? Icons.delete_forever_rounded
                          : Icons.delete_outline_rounded,
                      color: widget.isTrashView ? const Color(0xFFB91C1C) : Colors.black54,
                      tooltip: widget.isTrashView ? 'Elimina definitivamente' : 'Sposta nel cestino',
                      onTap: widget.onTrash,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        ),
      ),
    );
  }
}

/// Icona interattiva con area di tocco conforme alle linee guida (48dp),
/// etichetta per gli screen reader ed effetto di pressione visibile.
class _TapIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback? onTap;

  const _TapIcon({
    required this.icon,
    required this.color,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, size: 20),
      color: color,
      tooltip: tooltip,
      onPressed: onTap,
      visualDensity: VisualDensity.compact,
      constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
      padding: EdgeInsets.zero,
      splashRadius: 24,
    );
  }
}
