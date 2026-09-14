import 'package:flutter/material.dart';
import '../blocs/items/items_state.dart';

class StatsDialog extends StatelessWidget {
  final ItemsLoadedState state;

  const StatsDialog({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final hours = (state.totalTrackedSeconds / 3600).toStringAsFixed(1);
    final minutes = (state.totalTrackedSeconds % 3600) ~/ 60;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.bar_chart_rounded, color: Color(0xFFD97706)),
                    SizedBox(width: 8),
                    Text(
                      'Statistiche J.U.N.T.',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                IconButton(
                  tooltip: 'Chiudi',
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Time tracked card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, size: 32, color: Color(0xFF78350F)),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Tempo Tracciato', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF78350F))),
                      Text('${hours}h (${minutes}m)', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF78350F))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Grid: Notes & Tasks
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F2FE),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFBAE6FD)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Note Attive', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0369A1))),
                        const SizedBox(height: 4),
                        Text('${state.notesCount}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0C4A6E))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFBBF7D0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Task Risolti', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF15803D))),
                        const SizedBox(height: 4),
                        Text('${state.completedTasksCount} / ${state.tasksCount}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF14532D))),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Footer note
            const Center(
              child: Text(
                '100% Offline • Cache SQLite Locale • Sync Hono',
                style: TextStyle(fontSize: 11, color: Colors.black54, fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
