import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AllocationView() {
    const { inventoryId } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get(`/verify-allocation/${inventoryId}`)
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, [inventoryId]);

    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h2>Retail Allocation Verification</h2>
            <p>Inventory ID: {data.allocation.inventoryId}</p>
            <p>Retailer: {data.allocation.retailerId}</p>
            <p>Quantity: {data.allocation.quantity}</p>
            <p>Remaining: {data.allocation.remainingQuantity}</p>
            <p>Status: {data.parentBatchStatus}</p>
            <p>Integrity Score: {data.integrityScore}</p>
        </div>
    );
}