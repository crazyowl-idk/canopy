package com.thermonet.api.controller;

import com.thermonet.api.model.TelecomNode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nodes")
@CrossOrigin(origins = "http://localhost:5173") // Explicitly allows your Vite React app to connect
public class NodeController {

    @GetMapping
    public List<TelecomNode> getAllNodes() throws IOException {
        // Reads the JSON file from the resources folder
        ObjectMapper mapper = new ObjectMapper();
        ClassPathResource resource = new ClassPathResource("processed_nodes.json");
        
        // Maps the JSON array directly into a List of TelecomNode objects
        return mapper.readValue(resource.getInputStream(), new TypeReference<List<TelecomNode>>(){});
    }
}