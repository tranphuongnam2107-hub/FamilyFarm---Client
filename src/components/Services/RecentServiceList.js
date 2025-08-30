import React from "react";

const RecentServiceList = () => {
    const recentServices = [
        {
            name: "Vue.js TUTORIAL",
            image: "https://media.geeksforgeeks.org/wp-content/uploads/20240103164616/Vuejs-Tutorial.png",
        },
        {
            name: "React JS TUTORIAL",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNl6ByXPYWepPI7KOWpK9sW6RGfz8eH-DCJeGi3R1vhhO9_kzslj3e2rCxEbh52glj6GM&usqp=CAU",
        },
    ];

    return (
        <div className="p-6 max-h-fit bg-white rounded-lg shadow-md text-left border border-solid border-gray-200">
            <h2 className="text-lg font-bold mb-4">Recent Services</h2>
            <div className="grid grid-cols-1 gap-4">
                {recentServices.map((service, index) => (
                    <div key={index}
                        className="relative rounded-lg">
                        <img src={service.image}
                            alt={service.name}
                            className="w-full h-[150px] object-cover rounded-lg border border-solid border-gray-200"/>
                        <p className="absolute bottom-0 left-0 right-0 bg-gray-50 bg-opacity-50 p-3 text-md font-semibold rounded-b-lg">
                            {service.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentServiceList;