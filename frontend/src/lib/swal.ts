import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/sweetalert2.css";

const RaSwal = Swal.mixin({
  customClass: {
    popup: "ra-swal-popup",
    title: "ra-swal-title",
    content: "ra-swal-content",
    confirmButton: "ra-swal-confirm",
    cancelButton: "ra-swal-cancel",
    denyButton: "ra-swal-deny",
    closeButton: "ra-swal-close",
    input: "ra-swal-input",
  },
  buttonsStyling: false,
});

export default RaSwal;
