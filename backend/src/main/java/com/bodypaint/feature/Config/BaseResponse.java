package com.bodypaint.feature.Config;

import java.time.format.DateTimeFormatter;
import java.util.List;

import java.time.Instant;
import java.time.ZoneOffset;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BaseResponse<T> {
    private final T data;
    private final String message;
    private final List<String> errors;
    private final String timestamp;


public static <T> BaseResponse<T> ok(T data, String message){
    return BaseResponse.<T>builder()
                        .data(data)
                        .message(message)
                        .errors(null)
                        .timestamp(getCurrentTimestamp())
                        .build();
    }


    private static String getCurrentTimestamp(){
        return DateTimeFormatter.ISO_INSTANT
                                .withZone(ZoneOffset.UTC)
                                .format(Instant.now());
    }

    public static <T> BaseResponse<T> noContent(String message){
        return BaseResponse.<T>builder()
                            .data(null)
                            .message(message)
                            .errors(null)
                            .timestamp(getCurrentTimestamp())
                            .build();
    }

}
