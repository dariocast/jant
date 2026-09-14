import 'dart:convert';
import 'package:equatable/equatable.dart';

class TimeLog extends Equatable {
  final String start;
  final String? end;

  const TimeLog({required this.start, this.end});

  factory TimeLog.fromJson(Map<String, dynamic> json) {
    return TimeLog(
      start: json['start'] as String,
      end: json['end'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'start': start,
    'end': end,
  };

  @override
  List<Object?> get props => [start, end];
}

class ItemModel extends Equatable {
  final String id;
  final String title;
  final String content;
  final String color;
  final bool isPinned;
  final bool isArchived;
  final bool isTrashed;
  final DateTime? dueDate;
  final bool isCompleted;
  final List<TimeLog> timeLogs;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isSynced;

  const ItemModel({
    required this.id,
    required this.title,
    required this.content,
    required this.color,
    required this.isPinned,
    required this.isArchived,
    required this.isTrashed,
    this.dueDate,
    required this.isCompleted,
    required this.timeLogs,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    this.isSynced = true,
  });

  bool get isTask => dueDate != null;

  bool get isTimerRunning => timeLogs.any((log) => log.end == null);

  int get totalDurationSeconds {
    int total = 0;
    final now = DateTime.now();
    for (final log in timeLogs) {
      final startTime = DateTime.tryParse(log.start);
      if (startTime == null) continue;
      if (log.end != null) {
        final endTime = DateTime.tryParse(log.end!);
        if (endTime != null) {
          total += endTime.difference(startTime).inSeconds;
        }
      } else {
        total += now.difference(startTime).inSeconds;
      }
    }
    return total > 0 ? total : 0;
  }

  ItemModel copyWith({
    String? id,
    String? title,
    String? content,
    String? color,
    bool? isPinned,
    bool? isArchived,
    bool? isTrashed,
    DateTime? dueDate,
    bool? isCompleted,
    List<TimeLog>? timeLogs,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isSynced,
  }) {
    return ItemModel(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      color: color ?? this.color,
      isPinned: isPinned ?? this.isPinned,
      isArchived: isArchived ?? this.isArchived,
      isTrashed: isTrashed ?? this.isTrashed,
      dueDate: dueDate ?? this.dueDate,
      isCompleted: isCompleted ?? this.isCompleted,
      timeLogs: timeLogs ?? this.timeLogs,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  factory ItemModel.fromJson(Map<String, dynamic> json) {
    List<TimeLog> logs = [];
    if (json['timeLogs'] != null) {
      if (json['timeLogs'] is String) {
        try {
          final decoded = jsonDecode(json['timeLogs'] as String) as List;
          logs = decoded.map((e) => TimeLog.fromJson(e as Map<String, dynamic>)).toList();
        } catch (_) {}
      } else if (json['timeLogs'] is List) {
        logs = (json['timeLogs'] as List)
            .map((e) => TimeLog.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }

    List<String> parsedTags = [];
    if (json['tags'] != null) {
      if (json['tags'] is String) {
        try {
          final decoded = jsonDecode(json['tags'] as String) as List;
          parsedTags = decoded.map((e) => e.toString()).toList();
        } catch (_) {}
      } else if (json['tags'] is List) {
        parsedTags = (json['tags'] as List).map((e) => e.toString()).toList();
      }
    }

    return ItemModel(
      id: json['id'] as String,
      title: (json['title'] as String?) ?? '',
      content: (json['content'] as String?) ?? '',
      color: (json['color'] as String?) ?? '#FFFFFF',
      isPinned: (json['isPinned'] == 1 || json['isPinned'] == true),
      isArchived: (json['isArchived'] == 1 || json['isArchived'] == true),
      isTrashed: (json['isTrashed'] == 1 || json['isTrashed'] == true),
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate'] as String) : null,
      isCompleted: (json['isCompleted'] == 1 || json['isCompleted'] == true),
      timeLogs: logs,
      tags: parsedTags,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      isSynced: json['isSynced'] != 0,
    );
  }

  Map<String, dynamic> toSqliteMap() => {
    'id': id,
    'title': title,
    'content': content,
    'color': color,
    'isPinned': isPinned ? 1 : 0,
    'isArchived': isArchived ? 1 : 0,
    'isTrashed': isTrashed ? 1 : 0,
    'dueDate': dueDate?.toIso8601String(),
    'isCompleted': isCompleted ? 1 : 0,
    'timeLogs': jsonEncode(timeLogs.map((e) => e.toJson()).toList()),
    'tags': jsonEncode(tags),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'isSynced': isSynced ? 1 : 0,
  };

  Map<String, dynamic> toApiJson() => {
    'id': id,
    'title': title,
    'content': content,
    'color': color,
    'isPinned': isPinned,
    'isArchived': isArchived,
    'isTrashed': isTrashed,
    'dueDate': dueDate?.toIso8601String(),
    'isCompleted': isCompleted,
    'timeLogs': timeLogs.map((e) => e.toJson()).toList(),
    'tags': tags,
  };

  @override
  List<Object?> get props => [
    id,
    title,
    content,
    color,
    isPinned,
    isArchived,
    isTrashed,
    dueDate,
    isCompleted,
    timeLogs,
    tags,
    createdAt,
    updatedAt,
    isSynced,
  ];
}
