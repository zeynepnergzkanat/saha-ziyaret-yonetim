namespace FarmManagement.Api.Models
{
    public enum UserRole
    {
        Admin,
        FieldAgent
    }

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; 
        public UserRole Role { get; set; } = UserRole.FieldAgent;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}