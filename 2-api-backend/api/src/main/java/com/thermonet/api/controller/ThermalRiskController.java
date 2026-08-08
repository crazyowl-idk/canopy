package com.thermonet.api.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/nodes")
@CrossOrigin(origins = "*") // Allows your React frontend to connect locally
public class ThermalRiskController {

    @GetMapping("/risk-summary")
    public List<Map<String, Object>> getHighRiskNodes() {
        List<Map<String, Object>> nodes = new ArrayList<>();
        
        Map<String, Object> node1 = new HashMap<>();
        node1.put("id", "5G-KLCC-01");
        node1.put("location", "Bukit Bintang Corridor");
        node1.put("lat", 3.1466);
        node1.put("lng", 101.6958);
        node1.put("thermalStrainScore", 88.5);
        node1.put("status", "HIGH_THROTTLING_RISK");
        
        nodes.add(node1);
        return nodes;
    }
}