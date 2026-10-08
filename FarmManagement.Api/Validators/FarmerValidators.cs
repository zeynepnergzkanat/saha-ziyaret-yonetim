using FluentValidation;
using FarmManagement.Api.DTOs;

namespace FarmManagement.Api.Validators
{
    public class FarmerCreateDtoValidator : AbstractValidator<FarmerCreateDto>
    {
        public FarmerCreateDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Ad soyad boş bırakılamaz.")
                .MaximumLength(100);

            RuleFor(x => x.NationalId)
                .NotEmpty().WithMessage("Kimlik numarası boş bırakılamaz.")
                .Matches(@"^\d{11}$").WithMessage("Kimlik numarası 11 haneli rakamlardan oluşmalıdır.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası boş bırakılamaz.")
                .Matches(@"^(0)?5\d{9}$").WithMessage("Telefon numarası geçerli bir formatta olmalıdır (ör: 05XXXXXXXXX).");

            RuleFor(x => x.Region)
                .NotEmpty().WithMessage("Bölge boş bırakılamaz.");

            RuleFor(x => x.District)
                .NotEmpty().WithMessage("İlçe boş bırakılamaz.");
        }
    }

    public class FarmerUpdateDtoValidator : AbstractValidator<FarmerUpdateDto>
    {
        public FarmerUpdateDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Ad soyad boş bırakılamaz.")
                .MaximumLength(100);

            RuleFor(x => x.NationalId)
                .NotEmpty().WithMessage("Kimlik numarası boş bırakılamaz.")
                .Matches(@"^\d{11}$").WithMessage("Kimlik numarası 11 haneli rakamlardan oluşmalıdır.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası boş bırakılamaz.")
                .Matches(@"^(0)?5\d{9}$").WithMessage("Telefon numarası geçerli bir formatta olmalıdır (ör: 05XXXXXXXXX).");

            RuleFor(x => x.Region).NotEmpty();
            RuleFor(x => x.District).NotEmpty();
        }
    }
}