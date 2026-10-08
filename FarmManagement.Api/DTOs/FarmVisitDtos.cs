using FarmManagement.Api.Models;

namespace FarmManagement.Api.DTOs
{
    public class FarmVisitCreateDto
    {
        public int FarmerId { get; set; }
        public DateTime VisitDate { get; set; }
        public VisitType VisitType { get; set; }
        public string? Notes { get; set; }
        public VisitStatus Status { get; set; } = VisitStatus.Planned;
        public DateTime? NextVisitDate { get; set; }
    }

    public class FarmVisitUpdateDto
    {
        public DateTime VisitDate { get; set; }
        public VisitType VisitType { get; set; }
        public string? Notes { get; set; }
        public VisitStatus Status { get; set; }
        public DateTime? NextVisitDate { get; set; }
    }

    public class FarmVisitResponseDto
    {
        public int Id { get; set; }
        public int FarmerId { get; set; }
        public string? FarmerName { get; set; }
        public DateTime VisitDate { get; set; }
        public VisitType VisitType { get; set; }
        public string? Notes { get; set; }
        public VisitStatus Status { get; set; }
        public DateTime? NextVisitDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}