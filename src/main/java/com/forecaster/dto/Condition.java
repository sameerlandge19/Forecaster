package com.forecaster.dto;

public class Condition {

   	    public String text;
	    public String icon;
	    public int code;

	    public String getText() {
	        return text;
	    }

	    public void setText(String text) {
	        this.text = text;
	    }

	    public int getCode() {
	        return code;
	    }

	    public void setCode(int code) {
	        this.code = code;
	    }

	    public String getIcon() {
	        return icon;
	    }

	    public void setIcon(String icon) {
	        this.icon = icon;
	    }

	    public Condition(String text, int code, String icon) {
	        this.text = text;
	        this.code = code;
	        this.icon = icon;
	    }

	    public Condition() {
	    }

}
