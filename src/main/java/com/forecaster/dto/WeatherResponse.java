package com.forecaster.dto;

public class WeatherResponse {

	private String city;

    private String region;

    private String  country;

    private String condition;

    private String temperature;

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getTemperature() {
        return temperature;
    }

    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public WeatherResponse(String city, String region, String country, String condition, String temperature) {
        this.city = city;
        this.region = region;
        this.country = country;
        this.condition = condition;
        this.temperature = temperature;
    }

    public WeatherResponse() {
    }

}
