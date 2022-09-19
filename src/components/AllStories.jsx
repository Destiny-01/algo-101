import { useEffect, useState } from "react";
import {
  formatDate,
  microAlgosToString,
  stringToMicroAlgos,
} from "../utils/conversions";
import { Modal } from "materialize-css";
import { uploadToIpfs } from "../utils/request";

export default function AllStories({
  address,
  request,
  donateRequest,
  editRequest,
  deleteRequest,
}) {
  const [donation, setDonation] = useState(
    parseInt(microAlgosToString(request.min_donation))
  );
  const [editedRequest, setEditedRequest] = useState({
    ...request,
    min_donation: parseInt(microAlgosToString(request.min_donation)),
  });
  useEffect(() => {
    const elems = document.querySelectorAll(".modal");
    Modal.init(elems);
  }, []);
  const handleChange = (e) => {
    setEditedRequest({ ...editedRequest, [e.target.name]: e.target.value });
  };
  return (
    <>
      <div className="col">
        <div className="card">
          <div
            className="card-content center-align"
            style={{ padding: "12px" }}
          >
            <img
              alt="Request img"
              style={{ width: "15vw" }}
              src={request.image}
            />
            <h5>{request.title}</h5>
          </div>
          <div className="card-action center-align">
            <button
              data-target={`viewModal-${request.appId}`}
              className="btn btn-grey modal-trigger open-view"
            >
              Read More
            </button>
          </div>
        </div>
        <div
          id={`viewModal-${request.appId}`}
          className="modal modal-fixed-footer"
        >
          <div className="modal-content" id="viewModalContent">
            <div className="row">
              <div className="col s10">
                <h4>{request.title}</h4>
              </div>
              {request.owner === address && (
                <>
                  <div className="col s1">
                    <button
                      data-target={`editModal-${request.appId}`}
                      className="btn-floating modal-trigger btn waves-light green"
                    >
                      <i className="material-icons">edit</i>
                    </button>
                  </div>
                  <div className="col s1">
                    <button
                      onClick={() => deleteRequest(request)}
                      className="btn-floating btn waves-light red"
                    >
                      <i className="material-icons">delete</i>
                    </button>
                  </div>
                </>
              )}
            </div>
            <img
              alt="Request img"
              src={request.image}
              style={{ width: "50vw" }}
            />
            <h6>{formatDate(microAlgosToString(request.createdAt))}</h6>
            <p>{request.description}</p>
            <p>
              Total Donators:{" "}
              {request.donated > 0 ? microAlgosToString(request.donated) : 0}
            </p>
            {request.owner !== address ? (
              <>
                <p>Interested in donating for this folk?</p>
                <div className="input-field">
                  <input
                    value={donation}
                    onChange={(e) => setDonation(e.target.value)}
                    type="number"
                    name="donation"
                    id="donation"
                  />
                  <label htmlFor="donation" className="active">
                    Amount (must be more than the minimum (
                    {microAlgosToString(request.min_donation)} ALGO))
                  </label>
                </div>
                <button
                  disabled={
                    parseInt(microAlgosToString(request.min_donation)) >
                    donation
                  }
                  onClick={() =>
                    donateRequest(request, stringToMicroAlgos(donation))
                  }
                  className="waves-effect waves-green btn"
                >
                  Donate
                </button>
              </>
            ) : (
              <p>You can't donate to yourself</p>
            )}
          </div>
          <div className="modal-footer">
            <a
              href="#!"
              id="closeView"
              className="modal-close waves-effect waves-green btn-flat"
            >
              Close
            </a>
          </div>
        </div>
        <div
          id={`editModal-${request.appId}`}
          className="modal modal-fixed-footer"
        >
          <div className="modal-content">
            <h4 className="center">Edit Your Request</h4>
            <div className="row">
              <form className="col s12">
                <div className="row">
                  <div className="input-field">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      placeholder="40 characters max. Elaborate in description"
                      value={editedRequest.title}
                      onChange={handleChange}
                      maxLength={40}
                    />
                    <label className="active" htmlFor="title">
                      Title
                    </label>
                  </div>
                </div>
                <div className="row mt5">
                  <div className="input-field">
                    <input
                      value={editedRequest.description}
                      onChange={handleChange}
                      type="text"
                      name="description"
                      id="description"
                    />
                    <label className="active" htmlFor="description">
                      Description
                    </label>
                  </div>
                </div>
                <div className="row">
                  <div className="file-field input-field">
                    <div className="btn">
                      <span>Change Image</span>
                      <input
                        onChange={async (e) =>
                          setEditedRequest({
                            ...editedRequest,
                            image: await uploadToIpfs(e),
                          })
                        }
                        type="file"
                        name="image"
                        id="image"
                      />
                    </div>
                    <div className="file-path-wrapper">
                      <input className="file-path validate" type="text" />
                    </div>
                  </div>
                </div>
                <div className="row mt5">
                  <div className="input-field">
                    <input
                      value={
                        editedRequest.min_donation > 100
                          ? microAlgosToString(editedRequest.min_donation)
                          : editedRequest.min_donation
                      }
                      onChange={handleChange}
                      type="number"
                      name="min_donation"
                      id="min_donation"
                    />
                    <label htmlFor="min_donation" className="active">
                      Minimum Donation Amount
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn"
              onClick={() => {
                editRequest(editedRequest);
                document.getElementById("closeEdit").click();
              }}
            >
              Save
            </button>
            <a
              href="#!"
              id="closeEdit"
              className="modal-close waves-effect waves-green btn-flat"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
