import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import OrdersLayout from "../components/OrdersLayer";


function OrdersPage() {
    return (
        <MasterLayout>
            <Breadcrumb title="Orders" />
            <OrdersLayout />
        </MasterLayout>
    );
}

export default OrdersPage;