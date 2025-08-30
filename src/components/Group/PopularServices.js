import { Link } from "react-router-dom";

const PopularServices = () => {
  const services = [
    {
      title: "Solve problem about agriculture",
      price: "200.000 VND",
      image:
        "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain",
    },
    {
      title: "NodeJS online for beginner",
      price: "500.000 VND",
      image:
        "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain",
    },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-4 text-left">Popular Services</h2>
      {services.map((service, index) => (
        <Link key={index}>
          <div className="relative">
            <img
              src="https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
              alt={service.title}
              className="rounded-lg h-full w-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs rounded">
              {service.price}
            </span>
          </div>
          <p className="mt-2 font-medium mb-8">{service.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default PopularServices;
