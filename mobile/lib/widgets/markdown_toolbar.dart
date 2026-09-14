import 'package:flutter/material.dart';

/// Barra di formattazione Markdown condivisa fra creazione rapida e modifica,
/// così il gesto per inserire una checklist è lo stesso in tutta l'app
/// (e coincide con quello della versione web).
class MarkdownToolbar extends StatelessWidget {
  /// Riceve prefisso, suffisso e testo segnaposto da inserire.
  final void Function(String prefix, String suffix, String placeholder) onInsert;

  const MarkdownToolbar({super.key, required this.onInsert});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _MarkdownAction(
            label: 'Checklist',
            icon: Icons.checklist_rounded,
            onTap: () => onInsert('\n- [ ] ', '', 'task'),
          ),
          _MarkdownAction(
            label: 'H3',
            icon: Icons.title_rounded,
            onTap: () => onInsert('\n### ', '', 'Intestazione'),
          ),
          _MarkdownAction(
            label: 'Grassetto',
            icon: Icons.format_bold_rounded,
            onTap: () => onInsert('**', '**', 'grassetto'),
          ),
          _MarkdownAction(
            label: 'Corsivo',
            icon: Icons.format_italic_rounded,
            onTap: () => onInsert('*', '*', 'corsivo'),
          ),
          _MarkdownAction(
            label: 'Codice',
            icon: Icons.code_rounded,
            onTap: () => onInsert('`', '`', 'codice'),
          ),
        ],
      ),
    );
  }
}

class _MarkdownAction extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _MarkdownAction({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: Tooltip(
        message: label,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            constraints: const BoxConstraints(minHeight: 40),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 16, color: const Color(0xFF44403C)),
                const SizedBox(width: 5),
                Text(
                  label,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF44403C)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Inserisce markdown attorno alla selezione corrente del controller.
void insertMarkdownInto(
  TextEditingController controller,
  String prefix,
  String suffix,
  String placeholder,
) {
  final selection = controller.selection;
  final text = controller.text;
  final start = selection.start >= 0 ? selection.start : text.length;
  final end = selection.end >= 0 ? selection.end : text.length;

  final selected = start != end ? text.substring(start, end) : '';
  final body = selected.isEmpty ? placeholder : selected;

  controller.value = TextEditingValue(
    text: text.replaceRange(start, end, '$prefix$body$suffix'),
    selection: TextSelection(
      baseOffset: start + prefix.length,
      extentOffset: start + prefix.length + body.length,
    ),
  );
}
