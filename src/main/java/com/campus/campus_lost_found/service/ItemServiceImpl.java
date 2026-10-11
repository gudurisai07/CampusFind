
package com.campus.campus_lost_found.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.campus.campus_lost_found.Entity.Item;
import com.campus.campus_lost_found.Repository.ItemRepository;

@Service
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;

    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    @Override
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @Override
    public Item getItemById(Integer id) {
        return itemRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Item not found: " + id));
    }

    @Override
    public Item updateItem(Integer id, Item item) {

        Item existingItem = getItemById(id);

        existingItem.setItemName(item.getItemName());
        existingItem.setDescription(item.getDescription());
        existingItem.setCategory(item.getCategory());
        existingItem.setItemType(item.getItemType());
        existingItem.setColor(item.getColor());
        existingItem.setLocation(item.getLocation());
        existingItem.setEventDate(item.getEventDate());
        existingItem.setContactName(item.getContactName());
        existingItem.setContactEmail(item.getContactEmail());
        existingItem.setStatus(item.getStatus());

        return itemRepository.save(existingItem);
    }

    @Override
    public void deleteItem(Integer id) {

        if (!itemRepository.existsById(id)) {
            throw new RuntimeException(
                    "Item not found: " + id);
        }

        itemRepository.deleteById(id);
    }
}
