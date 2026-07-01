export function validate(schema, request) {
    const result = schema.validate(request, {
        abortEarly: false
    });
    
    if (result.error) {
        throw result.error;
    } else {
        return result.value;
    }
}