package com.supermarket.deliverysystem.controller;

import com.supermarket.deliverysystem.model.Product;
import com.supermarket.deliverysystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class StoreController {

    @Autowired
    private ProductRepository productRepository;

    // --- PRODUCT ENDPOINTS ---

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving product: " + e.getMessage());
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setName(productDetails.getName());
            product.setCategory(productDetails.getCategory());
            product.setSku(productDetails.getSku());
            product.setBarcode(productDetails.getBarcode());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setUnit(productDetails.getUnit());
            product.setUnitSize(productDetails.getUnitSize());
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
    }

    // BULK OR SINGLE INVENTORY AUTO-DEDUCTION
    @PostMapping("/products/deduct")
    public ResponseEntity<?> deductStock(@RequestBody Map<String, Object> payload) {
        try {
            Optional<Product> optionalProduct = Optional.empty();
            int deductQty = 1;

            if (payload.containsKey("quantity") && payload.get("quantity") != null) {
                deductQty = Integer.parseInt(payload.get("quantity").toString());
            }

            if (payload.containsKey("id") && payload.get("id") != null) {
                try {
                    Long id = Long.parseLong(payload.get("id").toString());
                    optionalProduct = productRepository.findById(id);
                } catch (NumberFormatException ignored) {}
            }

            if (optionalProduct.isEmpty() && payload.containsKey("barcode") && payload.get("barcode") != null) {
                String barcode = payload.get("barcode").toString();
                if (!barcode.isBlank()) {
                    optionalProduct = productRepository.findByBarcode(barcode);
                }
            }

            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                product.setStockQuantity(Math.max(0, currentStock - deductQty));
                Product updatedProduct = productRepository.save(product);
                return ResponseEntity.ok(updatedProduct);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deducting stock: " + e.getMessage());
        }
    }
}