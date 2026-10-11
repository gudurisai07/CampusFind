package com.campus.campus_lost_found.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campus.campus_lost_found.Entity.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Integer> {

}