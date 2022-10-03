/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "./utils/Loader";
import { NotificationError, NotificationSuccess } from "./utils/Notifications";
import {
  donateRequestAction,
  createRequestAction,
  deleteRequestAction,
  getRequestsAction,
  uploadToIpfs,
  editRequestAction,
} from "../utils/request";
import { Modal, Dropdown } from "materialize-css";
import AllStories from "./AllStories";
import { microAlgosToString, truncateAddress } from "../utils/conversions";

export default function Home({
  address,
  name,
  balance,
  disconnect,
  fetchBalance,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    image: "",
    description: "",
    min_donation: 0,
  });
  const handleChange = (e) => {
    setNewRequest({ ...newRequest, [e.target.name]: e.target.value });
  };
  const refresh = () => {
    setNewRequest({
      title: "",
      image: "",
      description: "",
      min_donation: 0,
    });
  };

  const getRequests = async (first = false) => {
    first && setLoading(true);
    getRequestsAction()
      .then((requests) => {
        if (requests) {
          console.log(requests);
          setRequests(requests);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally((_) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const elems = document.querySelectorAll(".modal");
    Modal.init(elems);
    const dElems = document.querySelectorAll(".dropdown-trigger");
    Dropdown.init(dElems);
    getRequests();
  }, []);

  const createRequest = async () => {
    try {
      setLoading(true);
      await createRequestAction(address, {...newRequest, createdAt: Date.now()})

      toast(<NotificationSuccess text="Request added successfully."/>);
      getRequests();
      fetchBalance(address);

    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to create a request."/>);
    } finally {
      setLoading(false);
    }
  };

  const editRequest = async (editedRequest) => {
    try {
      setLoading(true);
      await editRequestAction(address, editedRequest)
      toast(<NotificationSuccess text="Request edited successfully."/>);
      getRequests();
      fetchBalance(address);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to edit request."/>);
    } finally {
      setLoading(false);
    }

  };

  const donateRequest = async (request, amount) => {
    try {
      setLoading(true);
      await donateRequestAction(address, request, amount)
      toast(<NotificationSuccess text="Donated successfully"/>);
      getRequests();
      fetchBalance(address);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to donate request."/>);
      setLoading(false);
    }

  };

  const deleteRequest = async (request) => {
    try {
      setLoading(true);
      await deleteRequestAction(address, request.appId)

      toast(<NotificationSuccess text="Request deleted successfully"/>);
      getRequests();
      fetchBalance(address);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to delete request."/>);
      setLoading(false);
    }

  };

  const isFormFilled = useCallback(() => {
    return (
      newRequest.title &&
      newRequest.image &&
      newRequest.description &&
      newRequest.min_donation > 0
    );
  }, [
    newRequest.title,
    newRequest.image,
    newRequest.description,
    newRequest.min_donation,
  ]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div id="main">
      <div className="header">
        <nav className="grey darken-3">
          <div className="nav-wrapper">
            <a href="/dashboard" className="brand-logo center">
              Requestss
            </a>
            <ul className="right" style={{ marginRight: "32px" }}>
              <li>
                <a
                  className="dropdown-trigger btn"
                  href="#"
                  data-target="dropdown1"
                >
                  {name}({microAlgosToString(balance)} ALGO)
                </a>
                <ul id="dropdown1" className="dropdown-content">
                  <li>
                    <a
                      href={`https://testnet.algoexplorer.io/address/${address}`}
                    >
                      {name} <br /> {truncateAddress(address)}
                    </a>
                  </li>
                  <li className="divider" tabIndex="-1"></li>
                  <li>
                    <a href="#">Bal: {microAlgosToString(balance)} ALGO</a>
                  </li>
                  <li className="divider" tabIndex="-1"></li>
                  <li>
                    <button
                      className="waves-effect waves-light btn m-5"
                      onClick={() => disconnect()}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
                {/* </button> */}
              </li>
              <li></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="add_btn">
        <div className="fixed-action-btn">
          <button
            data-target="addModal"
            className="btn-floating btn-large waves-effect btn modal-trigger waves-light red"
          >
            <i className="material-icons">add</i>
          </button>
        </div>
      </div>
      <div className="container">
        <h1 className="center">All Requests</h1>
        <div className="row">
          {requests.length > 0 ? (
            requests.map((req, i) => {
              return (
                <AllStories
                  key={i}
                  address={address}
                  request={req}
                  donateRequest={donateRequest}
                  editRequest={editRequest}
                  deleteRequest={deleteRequest}
                />
              );
            })
          ) : (
            <Loader />
          )}
        </div>
      </div>
      {/* Modal Structure */}
      <div id="addModal" className="modal modal-fixed-footer">
        <div className="modal-content">
          <h4 className="center">Create New Request</h4>
          <div className="row">
            <form className="col s12">
              <div className="row">
                <div className="input-field">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="40 characters max. Elaborate in description"
                    value={newRequest.title}
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
                    value={newRequest.description}
                    onChange={handleChange}
                    type="text"
                    name="description"
                    id="description"
                  />
                  <label htmlFor="description">Description</label>
                </div>
              </div>
              <div className="row">
                <div className="file-field input-field">
                  <div className="btn">
                    <span>Select Image</span>
                    <input
                      onChange={async (e) => {
                        try {
                          setLoading(true)
                          const uploadImage = await uploadToIpfs(e)
                          setNewRequest({
                            ...newRequest,
                            image: uploadImage,
                          })
                        } catch (e) {
                          console.log({e})
                        } finally {
                          setLoading(false)
                        }
                      }
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
                    value={newRequest.min_donation}
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
            disabled={!isFormFilled()}
            onClick={() => {
              createRequest();
              refresh();
            }}
          >
            Save
          </button>
          <a
            href="#!"
            id="closeAdd"
            onClick={() => refresh()}
            className="modal-close waves-effect waves-green btn-flat"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
