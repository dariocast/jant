import 'database_helper.dart';
import 'api_service.dart';

class SyncManager {
  final DatabaseHelper dbHelper;
  final ApiService apiService;

  SyncManager({
    DatabaseHelper? dbHelper,
    ApiService? apiService,
  })  : dbHelper = dbHelper ?? DatabaseHelper.instance,
        apiService = apiService ?? ApiService();

  Future<void> sync() async {
    // 1. Push local unsynced items to backend
    final unsynced = await dbHelper.getUnsyncedItems();
    for (final item in unsynced) {
      final remoteItem = await apiService.createItem(item);
      if (remoteItem != null) {
        await dbHelper.insertOrUpdate(remoteItem.copyWith(isSynced: true));
      }
    }

    // 2. Fetch all remote items from backend and update local database
    final remoteItems = await apiService.fetchAllItems();
    if (remoteItems.isNotEmpty) {
      await dbHelper.batchSave(remoteItems.map((e) => e.copyWith(isSynced: true)).toList());
    }
  }
}
