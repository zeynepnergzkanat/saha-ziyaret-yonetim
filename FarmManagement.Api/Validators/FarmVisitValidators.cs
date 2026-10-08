using FluentValidation;
using FarmManagement.Api.DTOs;
using FarmManagement.Api.Models;

namespace FarmManagement.Api.Validators
{
    public class FarmVisitCreateDtoValidator : AbstractValidator<FarmVisitCreateDto>
    {
        public FarmVisitCreateDtoValidator()
        {
            RuleFor(x => x.FarmerId)
                .GreaterThan(0).WithMessage("Geçerli bir çiftçi seçilmelidir.");

            RuleFor(x => x.VisitDate)
                .NotEmpty().WithMessage("Ziyaret tarihi boş bırakılamaz.");

            
            RuleFor(x => x)
                .Must(x => !(x.Status == VisitStatus.Planned && x.VisitDate.Date < DateTime.UtcNow.Date))
                .WithMessage("Geçmiş bir tarih için planlı ziyaret oluşturulamaz.");

            
            RuleFor(x => x.Notes)
                .NotEmpty()
                .When(x => x.Status == VisitStatus.Completed)
                .WithMessage("Tamamlanan ziyaretler için not alanı zorunludur.");

            //  NextVisitDate, VisitDate'ten önce olamaz.
            RuleFor(x => x.NextVisitDate)
                .Must((dto, nextDate) => nextDate == null || nextDate >= dto.VisitDate)
                .WithMessage("Sonraki ziyaret tarihi, ziyaret tarihinden önce olamaz.");
        }
    }

    public class FarmVisitUpdateDtoValidator : AbstractValidator<FarmVisitUpdateDto>
    {
        public FarmVisitUpdateDtoValidator()
        {
            RuleFor(x => x.VisitDate)
                .NotEmpty().WithMessage("Ziyaret tarihi boş bırakılamaz.");

            RuleFor(x => x.Notes)
                .NotEmpty()
                .When(x => x.Status == VisitStatus.Completed)
                .WithMessage("Tamamlanan ziyaretler için not alanı zorunludur.");

            RuleFor(x => x.NextVisitDate)
                .Must((dto, nextDate) => nextDate == null || nextDate >= dto.VisitDate)
                .WithMessage("Sonraki ziyaret tarihi, ziyaret tarihinden önce olamaz.");
        }
    }
}