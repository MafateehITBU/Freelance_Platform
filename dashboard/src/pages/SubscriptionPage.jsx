import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SubscriptionLayer from "../components/SubscriptionLayer";


function SubscriptionPage() {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* Breadcrumb */}
                <Breadcrumb title="Subscription Page" />
                {/* Subscription Layer */}
                <SubscriptionLayer />
            </MasterLayout>
        </>
    );
}
export default SubscriptionPage;