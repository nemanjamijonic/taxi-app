namespace UserService.Dto
{
    public class CreateFavouriteAddressDto
    {
        public Guid UserId { get; set; }
        public string UserUsername { get; set; }
        public string AddressName { get; set; }
        public string Address { get; set; }
    }
}
