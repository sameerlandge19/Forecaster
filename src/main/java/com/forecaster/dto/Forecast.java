package com.forecaster.dto;

import java.util.ArrayList;

public class Forecast {

	   public ArrayList<ForecastDays> forecastday;

	    public ArrayList<ForecastDays> getForecastday() {
	        return forecastday;
	    }

	    public void setForecastday(ArrayList<ForecastDays> forecastday) {
	        this.forecastday = forecastday;
	    }

}
