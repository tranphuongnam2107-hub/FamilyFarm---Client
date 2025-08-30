import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useAddress = (selectedProvince, selectedDistrict) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get("https://esgoo.net/api-tinhthanh/1/0.htm");
                if (response.data.error === 0) {
                    setProvinces(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching provinces:", error);
                // toast.error("Unable to load province list.");
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`);
                    if (response.data.error === 0) {
                        setDistricts(response.data.data);
                        setWards([]);
                    }
                } catch (error) {
                    console.error("Error fetching districts:", error);
                    // toast.error("Unable to load district list.");
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    // Fetch wards when district changes
    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`);
                    if (response.data.error === 0) {
                        setWards(response.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching wards:", error);
                    // toast.error("Unable to load ward list.");
                }
            };
            fetchWards();
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    return { provinces, districts, wards };
};

export default useAddress;