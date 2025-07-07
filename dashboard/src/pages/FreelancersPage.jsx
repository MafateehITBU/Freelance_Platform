import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import FreelancersLayer from '../components/FreelancersLayer'

function FreelancersPage() {
    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Freelancers" />


                <FreelancersLayer />


            </MasterLayout>

        </>
    );
}

export default FreelancersPage