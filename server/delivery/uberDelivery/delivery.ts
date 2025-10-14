import 'dotenv/config';


const Delivery=(req, res)=>{

        try {
        const { orderId, customer, restaurantId, amount } = req.body;

        // Log request for debugging
        console.log("Uber delivery request received:", { orderId, customer, restaurantId, amount });

        // MOCK RESPONSE (later you can replace this with real Uber API call)
        const mockResponse = {
          success: true,
          deliveryId: `mock_${orderId}`,
          status: "created",
          eta: "20 mins",
        };

        // Return JSON — do NOT return HTML
        res.json(mockResponse);
      } catch (err) {
        console.error("Error triggering Uber delivery:", err);
        res.status(500).json({ success: false, error: "Failed to trigger Uber delivery" });
      }
}

export default Delivery;


