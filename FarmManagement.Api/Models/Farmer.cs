namespace FarmManagement.Api.Models
{
    public class Farmer
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string NationalId { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Region { get; set; } = string.Empty;

        public string District { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Bir çiftçinin birden fazla saha ziyareti olabilit
        public ICollection<FarmVisit> FarmVisits { get; set; } = new List<FarmVisit>();
    }
}