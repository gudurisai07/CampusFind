package com.campus.campus_lost_found.service;

import java.util.List;
import com.campus.campus_lost_found.Entity.Item;

public interface ItemService {

    Item createItem(Item item);

    List<Item> getAllItems();

    Item getItemById(Integer id);

    Item updateItem(Integer id, Item item);

    void deleteItem(Integer id);
}