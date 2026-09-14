import 'package:equatable/equatable.dart';
import '../../models/item_model.dart';

abstract class ItemsEvent extends Equatable {
  const ItemsEvent();

  @override
  List<Object?> get props => [];
}

class LoadItemsEvent extends ItemsEvent {
  final String filter;
  final String? tag;
  final String? search;

  const LoadItemsEvent({
    this.filter = 'all',
    this.tag,
    this.search,
  });

  @override
  List<Object?> get props => [filter, tag, search];
}

class AddItemEvent extends ItemsEvent {
  final ItemModel item;
  const AddItemEvent(this.item);

  @override
  List<Object?> get props => [item];
}

class UpdateItemEvent extends ItemsEvent {
  final ItemModel item;
  const UpdateItemEvent(this.item);

  @override
  List<Object?> get props => [item];
}

class DeleteItemEvent extends ItemsEvent {
  final String id;
  final bool permanent;
  const DeleteItemEvent(this.id, {this.permanent = false});

  @override
  List<Object?> get props => [id, permanent];
}

/// Riporta un elemento dal cestino all'elenco attivo.
class RestoreItemEvent extends ItemsEvent {
  final String id;
  const RestoreItemEvent(this.id);

  @override
  List<Object?> get props => [id];
}

class ToggleTimerEvent extends ItemsEvent {
  final String id;
  const ToggleTimerEvent(this.id);

  @override
  List<Object?> get props => [id];
}

class SyncItemsEvent extends ItemsEvent {}
