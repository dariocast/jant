import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/item_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('jant_local.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        color TEXT NOT NULL,
        isPinned INTEGER NOT NULL,
        isArchived INTEGER NOT NULL,
        isTrashed INTEGER NOT NULL,
        dueDate TEXT,
        isCompleted INTEGER NOT NULL,
        timeLogs TEXT NOT NULL,
        tags TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        isSynced INTEGER NOT NULL
      )
    ''');
  }

  Future<int> insertOrUpdate(ItemModel item) async {
    final db = await instance.database;
    return await db.insert(
      'items',
      item.toSqliteMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<ItemModel>> getItems({
    String filter = 'all',
    String? tag,
    String? search,
  }) async {
    final db = await instance.database;
    String whereClause = 'isTrashed = 0 AND isArchived = 0';
    List<dynamic> whereArgs = [];

    if (filter == 'trash') {
      whereClause = 'isTrashed = 1';
    } else if (filter == 'archived') {
      whereClause = 'isArchived = 1 AND isTrashed = 0';
    } else if (filter == 'notes') {
      whereClause = 'isTrashed = 0 AND isArchived = 0 AND dueDate IS NULL';
    } else if (filter == 'tasks') {
      whereClause = 'isTrashed = 0 AND isArchived = 0 AND dueDate IS NOT NULL';
    } else if (filter == 'pinned') {
      whereClause = 'isTrashed = 0 AND isArchived = 0 AND isPinned = 1';
    }

    if (search != null && search.trim().isNotEmpty) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      whereArgs.add('%$search%');
      whereArgs.add('%$search%');
    }

    final result = await db.query(
      'items',
      where: whereClause,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'isPinned DESC, updatedAt DESC',
    );

    List<ItemModel> items = result.map((json) => ItemModel.fromJson(json)).toList();

    if (tag != null && tag.isNotEmpty) {
      items = items.filter((i) => i.tags.contains(tag)).toList();
    }

    return items;
  }

  Future<ItemModel?> getItemById(String id) async {
    final db = await instance.database;
    final maps = await db.query(
      'items',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isNotEmpty) {
      return ItemModel.fromJson(maps.first);
    }
    return null;
  }

  Future<int> deleteItemPermanently(String id) async {
    final db = await instance.database;
    return await db.delete('items', where: 'id = ?', whereArgs: [id]);
  }

  Future<List<ItemModel>> getUnsyncedItems() async {
    final db = await instance.database;
    final result = await db.query('items', where: 'isSynced = 0');
    return result.map((json) => ItemModel.fromJson(json)).toList();
  }

  Future<void> batchSave(List<ItemModel> items) async {
    final db = await instance.database;
    final batch = db.batch();
    for (final item in items) {
      batch.insert(
        'items',
        item.toSqliteMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }
}

extension ListFilter<T> on List<T> {
  List<T> filter(bool Function(T) test) {
    return where(test).toList();
  }
}
