import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/item_model.dart';

class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://localhost:3000'});

  Future<List<ItemModel>> fetchAllItems() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/items?filter=all')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List list = data['items'] ?? [];
        return list.map((json) => ItemModel.fromJson(json)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<ItemModel?> createItem(ItemModel item) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/items'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(item.toApiJson()),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return ItemModel.fromJson(data['item']);
      }
    } catch (_) {}
    return null;
  }

  Future<ItemModel?> updateItem(ItemModel item) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/api/items/${item.id}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(item.toApiJson()),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ItemModel.fromJson(data['item']);
      }
    } catch (_) {}
    return null;
  }

  Future<bool> deleteItem(String id, {bool permanent = false}) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/api/items/$id?permanent=$permanent'),
      ).timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (_) {}
    return false;
  }

  Future<ItemModel?> toggleTimer(String id) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/items/$id/timer/toggle'),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ItemModel.fromJson(data['item']);
      }
    } catch (_) {}
    return null;
  }
}
