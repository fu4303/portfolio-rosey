import React, { useState, useEffect } from "react"
import classNames from 'classnames';
import { useIsInView } from "hooks";
import Link from "components/_ui/Link/Link";
import PropTypes from 'prop-types';
import './PostLinks.scss';

const PostLinks = ({ demo, repo, children, className }) => {

    const [ref, isInView] = useIsInView()

    return (
        <div ref={ref}
            className={classNames(className, "PostLinks__container", {
                "PostLinks__container--isInView": isInView
            })}>
            <div className="PostLinks">
                {demo && (
                    <Link
                        className="PostLinks__link PostLinks__link__button"
                        doOpenInNewTab
                        isButton
                        to={demo}>
                        Demo site
                    </Link>
                )}
                {repo && (
                    <Link
                        className="PostLinks__link"
                        doOpenInNewTab
                        to={repo}>
                        Github repo
                    </Link>
                )}
            </div>
        </div>
    );
};

PostLinks.propTypes = {

};

export default PostLinks;