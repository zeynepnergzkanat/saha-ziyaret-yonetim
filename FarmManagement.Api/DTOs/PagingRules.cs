namespace FarmManagement.Api.DTOs
{
    public static class PagingRules
    {
        public const int MaxPageSize = 1000;

        public static readonly string ErrorMessage =
            $"page 1 veya daha büyük, pageSize 1 ile {MaxPageSize} arasında olmalıdır.";

        public static bool IsValid(int page, int pageSize) =>
            page >= 1 && pageSize >= 1 && pageSize <= MaxPageSize;
    }
}