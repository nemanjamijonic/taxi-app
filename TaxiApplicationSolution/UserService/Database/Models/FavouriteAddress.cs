namespace UserService.Database.Models
{
    public class FavouriteAddress
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserUsername { get; set; }
        public string AddressName { get; set; }
        public string Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
