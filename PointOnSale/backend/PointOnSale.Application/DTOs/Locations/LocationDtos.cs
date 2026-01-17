using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Locations;

public class CountryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class CreateCountryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
}

public class UpdateCountryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
}

public class StateDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int CountryId { get; set; }
    public string CountryName { get; set; }
}

public class CreateStateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    public int CountryId { get; set; }
}

public class UpdateStateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    public int CountryId { get; set; }
}

public class DistrictDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int StateId { get; set; }
    public string StateName { get; set; }
}

public class CreateDistrictDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    public int StateId { get; set; }
}

public class UpdateDistrictDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    public int StateId { get; set; }
}

public class LocalDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int DistrictId { get; set; }
    public string DistrictName { get; set; }
}

public class CreateLocalDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    public int DistrictId { get; set; }
}

public class UpdateLocalDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    public int DistrictId { get; set; }
}
