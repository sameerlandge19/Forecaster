package com.forecaster.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forecaster.dto.DailyWeatherResponse;
import com.forecaster.dto.WeatherResponse;
import com.forecaster.service.WeatherService;

@RestController
@RequestMapping("/weather")
@CrossOrigin
public class Controller {

	    @Autowired
	    private WeatherService service;

	    @GetMapping("/{city}")
	    public String getWeatherData(@PathVariable String city){
	        return service.test();
	    }

	    @GetMapping("/my/{city}")
	    public WeatherResponse getWeather(@PathVariable String city){
	        return service.getData(city);
	    }

	   /* @GetMapping("/response")
	    public DailyWeatherResponse getDailyWeatherResponse(@RequestParam String city,  @RequestParam int days){

	        return service.getDailyWeatherResponse(city, days);
	    }*/
	    @GetMapping("/response")
	    public ResponseEntity<DailyWeatherResponse> getDailyWeatherResponse(
	            @RequestParam String city, 
	            @RequestParam int days) {
	        try {
	            DailyWeatherResponse response = service.getDailyWeatherResponse(city, days);
	            return ResponseEntity.ok(response);
	        } catch (Exception e) {
	            e.printStackTrace();
	            // Return a proper error response instead of letting Spring return HTML error page
	            return ResponseEntity.status(500).body(null);
	        }
	    }


}
