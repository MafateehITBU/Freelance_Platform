import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ServiceLayer from "../components/ServicesLayer";


function ServicesPage() {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* Breadcrumb */}
                <Breadcrumb title="Services Page" />
                {/* Services Layer */}
                <ServiceLayer />
            </MasterLayout>
        </>
    );
}

export default ServicesPage;