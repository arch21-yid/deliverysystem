package com.supermarket.deliverysystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private String sku;
    private String barcode;
    private Double price;
    private Integer stockQuantity;
    private String unit;      // e.g., "L", "kg", "g", "ml", "pcs"
    private Double unitSize;  // e.g., 0.5, 1.0, 2.0, 10.0

    public Product() {}

    public Product(String name, String category, String sku, String barcode, Double price, Integer stockQuantity, String unit, Double unitSize) {
        this.name = name;
        this.category = category;
        this.sku = sku;
        this.barcode = barcode;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.unit = unit;
        this.unitSize = unitSize;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getUnitSize() {
        return unitSize;
    }

    public void setUnitSize(Double unitSize) {
        this.unitSize = unitSize;
    }
}