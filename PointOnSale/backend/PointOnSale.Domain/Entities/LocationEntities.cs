using System.Collections.Generic;

namespace PointOnSale.Domain.Entities;

public class LocationCountry
{
    public int Id { get; set; }
    public string Name { get; set; }
    
    public ICollection<LocationState> States { get; set; }
}

public class LocationState
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int CountryId { get; set; }
    
    public LocationCountry Country { get; set; }
    public ICollection<LocationDistrict> Districts { get; set; }
}

public class LocationDistrict
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int StateId { get; set; }
    
    public LocationState State { get; set; }
    public ICollection<LocationLocal> Locals { get; set; }
}

public class LocationLocal
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int DistrictId { get; set; }
    
    public LocationDistrict District { get; set; }
}
