package zhaolong.dai.nav.result;

import lombok.Data;
import zhaolong.dai.nav.constans.MessageConstants;

import java.io.Serializable;

@Data
public class Result<T> implements Serializable {

    private Integer code;
    private String msg;
    private T data;

    public static <T> Result<T> success() {
        Result<T> result = new Result<T>();
        result.setCode(1);
        result.setMsg(MessageConstants.SUCCESS);
        return result;
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<T>();
        result.setCode(1);
        result.setMsg(MessageConstants.SUCCESS);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(T data, String msg) {
        Result<T> result = new Result<T>();
        result.setCode(1);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error(String msg) {
        Result<T> result = new Result<T>();
        result.setCode(0);
        result.setMsg(msg);
        return result;
    }

}
