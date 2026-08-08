package com.thermonet.api.model;

public class TelecomNode {
    private String id;
    private double lat;
    private double lng;
    private String location;
    private double baseLST;
    private double baseDensity;
    private int networkPenalty;

    // Getters
    public String getId() { return id; }
    public double getLat() { return lat; }
    public double getLng() { return lng; }
    public String getLocation() { return location; }
    public double getBaseLST() { return baseLST; }
    public double getBaseDensity() { return baseDensity; }
    public int getNetworkPenalty() { return networkPenalty; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setLat(double lat) { this.lat = lat; }
    public void setLng(double lng) { this.lng = lng; }
    public void setLocation(String location) { this.location = location; }
    public void setBaseLST(double baseLST) { this.baseLST = baseLST; }
    public void setBaseDensity(double baseDensity) { this.baseDensity = baseDensity; }
    public void setNetworkPenalty(int networkPenalty) { this.networkPenalty = networkPenalty; }
}