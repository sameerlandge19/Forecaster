/*
package com.forecaster.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.forecaster.dto.DailyWeatherResponse;
import com.forecaster.dto.DayTemp;
import com.forecaster.dto.Forecast;
import com.forecaster.dto.ForecastDays;
import com.forecaster.dto.Root;
import com.forecaster.dto.WeatherResponse;

@Service
public class WeatherService {

	   @Value("${weather.api.key}")
	    private String apikey;

	    @Value("${weather.api.url}")
	    private String apiUrl;


	    @Value("${weather.api.Forecast.url}")
	    private String apiForecasturl;

	    private final RestTemplate template = new RestTemplate();

	    public String test() {
	        return "good";
	    }

	    public WeatherResponse getData(String city) {
	        String url = apiUrl + "?key=" + apikey + "&q=" + city;
	        Root response = template.getForObject(url, Root.class);
	        WeatherResponse weatherResponse = new WeatherResponse();
//	        String c=response.getLocation().name;
//	        String region=response.getLocation().region;
//	        String country=response.getLocation().country;

	        assert response != null;
	        weatherResponse.setCity(response.getLocation().name);
	        weatherResponse.setRegion(response.getLocation().region);
	        weatherResponse.setCountry(response.getLocation().country);
	        String condition = response.getCurrent().getCondition().getText();
	        weatherResponse.setCondition(condition);
	        weatherResponse.setTemperature(String.valueOf(response.getCurrent().getTemp_c()));


	        return weatherResponse;
	    }

	    public DailyWeatherResponse getDailyWeatherResponse(String city, int days) {
	        DailyWeatherResponse dailyweatherresponse= new DailyWeatherResponse();
	        WeatherResponse weatherResponse = getData(city);
	        DailyWeatherResponse response = new DailyWeatherResponse();
	        response.setWeatherResponse(weatherResponse);


	        List<DayTemp> dayList = new ArrayList<>();
	        String url = apiForecasturl + "?key=" + apikey + "&q=" + city + "&days=" + days;
	        Root Apiresponse = template.getForObject(url, Root.class);
	        Forecast forecast = Apiresponse.getForecast();
	        ArrayList<ForecastDays> forecastdays = forecast.getForecastday();
	        for (ForecastDays rs : forecastdays)
	        {
	            DayTemp d = new DayTemp();
	            d.setDate(rs.getDate());
	            d.setMinTemp(rs.getDay().mintemp_c);
	            d.setAvgTemp(rs.getDay().avgtemp_c);
	            d.setMaxTemp(rs.getDay().maxtemp_c);
	            dayList.add(d);

	        }
	        response.setDayTemp(dayList);
	        return response;

	    }

}
*/

package com.forecaster.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.forecaster.dto.DailyWeatherResponse;
import com.forecaster.dto.DayTemp;
import com.forecaster.dto.Forecast;
import com.forecaster.dto.ForecastDays;
import com.forecaster.dto.Root;
import com.forecaster.dto.WeatherResponse;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String apikey;

    @Value("${weather.api.url}")
    private String apiUrl;

    @Value("${weather.api.Forecast.url}")
    private String apiForecasturl;

    private final RestTemplate template = new RestTemplate();

    public String test() {
        return "good";
    }

    public WeatherResponse getData(String city) {
        try {
            String url = apiUrl + "?key=" + apikey + "&q=" + city;
            System.out.println("Calling weather API: " + url);
            
            Root response = template.getForObject(url, Root.class);
            WeatherResponse weatherResponse = new WeatherResponse();

            if (response != null && response.getLocation() != null && response.getCurrent() != null) {
                weatherResponse.setCity(response.getLocation().name);
                weatherResponse.setRegion(response.getLocation().region);
                weatherResponse.setCountry(response.getLocation().country);
                
                if (response.getCurrent().getCondition() != null) {
                    String condition = response.getCurrent().getCondition().getText();
                    weatherResponse.setCondition(condition);
                }
                
                weatherResponse.setTemperature(String.valueOf(response.getCurrent().getTemp_c()));
            }

            return weatherResponse;
        } catch (Exception e) {
            System.err.println("Error fetching current weather: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch weather data for " + city, e);
        }
    }

    public DailyWeatherResponse getDailyWeatherResponse(String city, int days) {
        try {
            System.out.println("Getting daily weather for city: " + city + ", days: " + days);
            
            // Get current weather
            WeatherResponse weatherResponse = getData(city);
            
            // Create response object
            DailyWeatherResponse response = new DailyWeatherResponse();
            response.setWeatherResponse(weatherResponse);

            // Get forecast data
            List<DayTemp> dayList = new ArrayList<>();
            String url = apiForecasturl + "?key=" + apikey + "&q=" + city + "&days=" + days;
            System.out.println("Calling forecast API: " + url);
            
            Root apiResponse = template.getForObject(url, Root.class);
            
            if (apiResponse != null && apiResponse.getForecast() != null) {
                Forecast forecast = apiResponse.getForecast();
                ArrayList<ForecastDays> forecastdays = forecast.getForecastday();
                
                if (forecastdays != null) {
                    for (ForecastDays rs : forecastdays) {
                        if (rs != null && rs.getDay() != null) {
                            DayTemp d = new DayTemp();
                            d.setDate(rs.getDate());
                            d.setMinTemp(rs.getDay().mintemp_c);
                            d.setAvgTemp(rs.getDay().avgtemp_c);
                            d.setMaxTemp(rs.getDay().maxtemp_c);
                            dayList.add(d);
                        }
                    }
                }
            }
            
            response.setDayTemp(dayList);
            System.out.println("Successfully created response with " + dayList.size() + " forecast days");
            return response;
            
        } catch (Exception e) {
            System.err.println("Error in getDailyWeatherResponse: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch daily weather data for " + city, e);
        }
    }
}
