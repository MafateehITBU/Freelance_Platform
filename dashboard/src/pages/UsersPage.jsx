import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import UsersLayer from "../components/UsersLayer";

function UsersPage() {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* Breadcrumb */}
                <Breadcrumb title="Users" />
                <UsersLayer />
            </MasterLayout>
        </>
    );
}

export default UsersPage;