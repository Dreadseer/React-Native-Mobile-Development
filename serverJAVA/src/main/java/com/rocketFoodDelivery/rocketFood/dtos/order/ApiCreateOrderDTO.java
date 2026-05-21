package com.rocketFoodDelivery.rocketFood.dtos.order;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApiCreateOrderDTO {
    @JsonProperty("restaurant_id")
    private int restaurantId;

    @JsonProperty("customer_id")
    private int customerId;

    private List<ProductItem> products;

    @JsonProperty("sendEmail")
    private boolean sendEmail = false;

    @JsonProperty("sendSMS")
    private boolean sendSms = false;

    @Getter
    @Setter
    public static class ProductItem {
        @JsonProperty("product_id")
        private int id;
        private int quantity;
    }
}
